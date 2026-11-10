import ast
import hashlib
import itertools
import json
from pathlib import Path
from types import SimpleNamespace

import pytest

SOURCE = Path(__file__).resolve().parents[1] / "contracts" / "SemanticEffectCommutator.py"
HELPERS = [n for n in ast.parse(SOURCE.read_text(encoding="utf-8")).body if isinstance(n, (ast.Assign, ast.FunctionDef))]
SPEC = {"id": "study", "root": "input", "states": ["red", "blue", "green"], "operations": ["rotate", "reset"]}


def helpers(gl=None):
    ns = {"hashlib": hashlib, "json": json, "gl": gl}
    exec(compile(ast.Module(body=HELPERS, type_ignores=[]), str(SOURCE), "exec"), ns)
    return ns


def test_exhaustive_effect_tables_against_reference_execution():
    derive = helpers()["derive"]
    domain = ("S0", "S1", "S2", "BLOCKED", "UNKNOWN")
    rows = list(itertools.product(domain, repeat=3))

    def run(start, operations):
        state = start
        for operation in operations:
            state = operation[state]
            if state not in ("S0", "S1", "S2"):
                break
        return state

    for a, b in itertools.product(rows, repeat=2):
        maps = [dict(zip(domain[:3], row)) for row in (a, b)]
        differences, uncertain = [], []
        r = derive(SPEC, {"a": list(a), "b": list(b)})
        for i, start in enumerate(domain[:3]):
            ab, ba = run(start, maps), run(start, maps[::-1])
            assert r["rows"][i]["a_then_b"] == {"after_first": a[i], "atomic_outcome": ab}
            assert r["rows"][i]["b_then_a"] == {"after_first": b[i], "atomic_outcome": ba}
            if ab == "UNKNOWN" or ba == "UNKNOWN":
                uncertain.append(i)
            elif ab != ba:
                differences.append(i)
        assert r["witnesses"] == differences and r["unresolved"] == uncertain
        assert r["status"] == ("ORDER_SENSITIVE" if differences else "INCONCLUSIVE" if uncertain else "COMMUTES_ON_FRAME")


@pytest.mark.parametrize("bad", [
    '{"a":[],"a":[],"b":[]}',
    {"a": ["S0", "S1", "S2"], "b": ["S0", "S1", 2]},
    {"a": ["S0", "S1", "S2"], "b": ["S0", "S1", "S2"], "confidence": 1},
    {"a": ["S0", "S1", "S3"], "b": ["S0", "S1", "S2"]},
])
def test_malformed_effects(bad):
    with pytest.raises(ValueError):
        helpers()["parse"](bad)


def test_callback_rejects_valid_rehashed_false_effect_and_foreign_input():
    ns = helpers()
    effects = {"a": ["S1", "S2", "S0"], "b": ["S0", "S0", "S0"]}
    calls = []

    class Return:
        def __init__(self, x):
            self.calldata = x

    def model(prompt, response_format):
        assert all(word in prompt for word in ("red", "blue", "green", "rotate", "reset"))
        assert response_format == "json"
        calls.append(prompt)
        return effects

    def run(leader, validate):
        honest = leader()
        assert validate(Return(honest))
        false = ns["derive"](SPEC, {**effects, "b": ["S0", "S1", "S2"]})
        assert false["status"] == "COMMUTES_ON_FRAME"
        assert not validate(Return(false))
        assert not validate(Return(ns["derive"]({**SPEC, "root": "wrong"}, effects)))
        assert not validate(object())
        return honest

    gl = SimpleNamespace(vm=SimpleNamespace(Return=Return, run_nondet_unsafe=run, UserError=ValueError),
                         nondet=SimpleNamespace(exec_prompt=model))
    assert helpers(gl)["interpret"](SPEC)["status"] == "ORDER_SENSITIVE"
    assert len(calls) == 4


def test_direct_permissionless_analysis_and_bound_reads(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = direct_deploy(str(SOURCE))
    direct_vm.sender = direct_alice
    ident = c.register("study", "Red", "Blue", "Green", "Rotate the color.", "Set it red.")
    root = c.get_study(ident)["root"]
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("Input root mismatch"):
        c.analyze(ident, "wrong")
    direct_vm.mock_llm(r".*EFFECT_COMMUTATOR_V1.*", json.dumps({"a": ["S1", "S2", "S0"], "b": ["S0", "S0", "S0"]}))
    report_root = c.analyze(ident, root)
    report = c.get_report(ident)
    assert report["witnesses"] == [0, 1, 2]
    assert c.inspect_order(ident, root, report_root, 0)["a_then_b"]["atomic_outcome"] == "S0"
    with direct_vm.expect_revert("Report context mismatch"):
        c.inspect_order(ident, root, "wrong", 0)
    with direct_vm.expect_revert("Report already published"):
        c.analyze(ident, root)

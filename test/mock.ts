import actions from "@actions/core";
import { type Stub, stub } from "@std/testing/mock";
import { ActionInputs } from "../src/inputs.ts";

export class ActionInputsMock implements Disposable {
  readonly getInputStub: Stub<typeof actions>;
  readonly getMultiLineInputStub: Stub<typeof actions>;

  constructor(inputs: ActionInputs) {
    const { root, config, source } = inputs;
    this.getInputStub = stub(
      actions,
      "getInput",
      (name) => ({ root, config })[name] ?? "",
    );
    this.getMultiLineInputStub = stub(
      actions,
      "getMultilineInput",
      (name) => ({ source })[name] ?? [],
    );
  }

  [Symbol.dispose]() {
    this.getInputStub.restore();
    this.getMultiLineInputStub.restore();
  }
}

import detectFramework from "../../../lib/utils/frameworkDetection";

describe("GetBrowserDetails", () => {

  it("should be react", () => {
    window["React"] = {};
    expect(detectFramework()).toStrictEqual(["React"]);
  });
  
  it("should be angular", () => {
    window["React"] = null;
    window["angular"] = {};
    expect(detectFramework()).toStrictEqual(["Angular.js"]);
  });
  
  it("should be angular and jquery", () => {
    window["jQuery"] = {};

    expect(detectFramework()).toStrictEqual(["Angular.js", "jQuery.js"]);
  });
});

import {
  convertMsToCMITimespan,
  convertToTimeInterval,
  SCORMAdapter,
} from "./SCORMAdapter";

describe("API discovery", () => {
  const originalWindow = (global as any).window;

  afterEach(() => {
    (global as any).window = originalWindow;
  });

  const makeWindow = (props: Record<string, any>) => {
    const win: any = { ...props };
    win.parent = win; // top window: parent === self
    return win;
  };

  const make2004API = () => ({
    Initialize: jest.fn(() => "true"),
    Terminate: jest.fn(() => "true"),
    GetValue: jest.fn(() => ""),
    SetValue: jest.fn(() => "true"),
    Commit: jest.fn(() => "true"),
    GetLastError: jest.fn(() => "0"),
    GetErrorString: jest.fn(() => ""),
    GetDiagnostic: jest.fn(() => ""),
  });

  test("ignores a stray non-1.2 window.API and selects the real 2004 runtime", () => {
    const realAPI = make2004API();
    // window.API exists but is NOT a valid 1.2 adapter (no LMSInitialize),
    // mimicking Cornerstone's 2004 launch frame.
    (global as any).window = makeWindow({
      API: { someUnrelatedNamespace: true },
      API_1484_11: realAPI,
    });

    const adapter = new SCORMAdapter();

    expect(adapter.foundAPI).toBe(true);
    expect(() => adapter.LMSInitialize()).not.toThrow();
    expect(realAPI.Initialize).toHaveBeenCalled();
  });

  test("still selects a valid 1.2 API when present (no regression)", () => {
    const api12 = {
      LMSInitialize: jest.fn(() => "true"),
      LMSGetLastError: jest.fn(() => "0"),
      LMSSetValue: jest.fn(() => "true"),
      LMSGetValue: jest.fn(() => ""),
      LMSGetErrorString: jest.fn(() => ""),
      LMSGetDiagnostic: jest.fn(() => ""),
    };
    (global as any).window = makeWindow({ API: api12 });

    const adapter = new SCORMAdapter();
    adapter.LMSInitialize();

    expect(api12.LMSInitialize).toHaveBeenCalled();
  });

  test("does not throw when the selected API is missing a called function", () => {
    const api = make2004API();
    delete (api as any).Terminate;
    (global as any).window = makeWindow({ API_1484_11: api });

    const adapter = new SCORMAdapter();

    expect(() => adapter.LMSTerminate()).not.toThrow();
  });
});

test('convertMsToCMITimespan ("0000:00:00.00")', () => {
  const milliseconds = 36 * 60 * 60 * 1000 + 6 * 60 * 1000 + 2 * 1000 + 23 * 10;
  const CMITimespan = convertMsToCMITimespan(milliseconds);
  expect(CMITimespan).toBe("0036:06:02.23");
});

test("convertToTimeInterval", () => {
  const milliseconds = 36 * 60 * 60 * 1000 + 6 * 60 * 1000 + 2 * 1000 + 23 * 10;
  const timeInterval = convertToTimeInterval(milliseconds);
  expect(timeInterval).toBe("P1DT12H6M2S");
});

describe("setProgress", () => {
  const originalWindow = (global as any).window;

  afterEach(() => {
    (global as any).window = originalWindow;
  });

  const makeWindow = (props: Record<string, any>) => {
    const win: any = { ...props };
    win.parent = win;
    return win;
  };

  const make2004API = () => ({
    Initialize: jest.fn(() => "true"),
    Terminate: jest.fn(() => "true"),
    GetValue: jest.fn(() => ""),
    SetValue: jest.fn(() => "true"),
    Commit: jest.fn(() => "true"),
    GetLastError: jest.fn(() => "0"),
    GetErrorString: jest.fn(() => ""),
    GetDiagnostic: jest.fn(() => ""),
  });

  test("writes cmi.progress_measure clamped to [0,1] on SCORM 2004", () => {
    const api = make2004API();
    (global as any).window = makeWindow({ API_1484_11: api });

    const adapter = new SCORMAdapter();
    adapter.setProgress(0.5);
    expect(api.SetValue).toHaveBeenCalledWith("cmi.progress_measure", 0.5);

    adapter.setProgress(1.7);
    expect(api.SetValue).toHaveBeenCalledWith("cmi.progress_measure", 1);
  });

  test("is a no-op on SCORM 1.2 (no progress_measure field)", () => {
    const api12 = {
      LMSInitialize: jest.fn(() => "true"),
      LMSGetLastError: jest.fn(() => "0"),
      LMSSetValue: jest.fn(() => "true"),
      LMSGetValue: jest.fn(() => ""),
      LMSGetErrorString: jest.fn(() => ""),
      LMSGetDiagnostic: jest.fn(() => ""),
    };
    (global as any).window = makeWindow({ API: api12 });

    const adapter = new SCORMAdapter();
    adapter.setProgress(0.5);

    expect(api12.LMSSetValue).not.toHaveBeenCalledWith(
      "cmi.progress_measure",
      expect.anything(),
    );
  });
});

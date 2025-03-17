/**
 * @jest-environment jsdom
 */

import { loadContent } from "./loadContent";
import { HTMLGenerator } from "./HTMLGenerator";
import { SCORMAdapter } from "./SCORMAdapter";
import { MessageReceiver } from "./MessageHandler";

const fakeAPI12Values = {
  "cmi.core.student_id": "JohnDoeID",
  "cmi.core.student_name": "John Doe",
  "cmi.launch_data": '{"lms_origin":"http://localhost"}',
};

const fakeAPI2004Values = {
  "cmi.learner_id": "JohnDoeID",
  "cmi.learner_name": "John Doe",
  "cmi.launch_data": '{"lms_origin":"http://localhost"}',
};

declare global {
  interface Window {
    SCORMAdapter: typeof SCORMAdapter;
    MessageReceiver: typeof MessageReceiver;

    // 1.2 API
    API?: {
      LMSInitialize: () => boolean;
      LMSFinish: VoidFunction;
      LMSGetValue: (key: string) => string;
      LMSSetValue: () => boolean;
      LMSCommit: VoidFunction;
      LMSGetLastError: () => number;
      LMSGetErrorString: VoidFunction;
      LMSGetDiagnostic: VoidFunction;
    };

    // 2004 API
    API_1484_11?: {
      Initialize: () => boolean;
      Terminate: VoidFunction;
      GetValue: (key: string) => string;
      SetValue: () => boolean;
      Commit: VoidFunction;
      GetLastError: () => number;
      GetErrorString: VoidFunction;
      GetDiagnostic: VoidFunction;
    };
  }
}

function initializeAPI12() {
  window.API = {
    LMSInitialize: jest.fn(() => true),
    LMSFinish: jest.fn(),
    LMSGetValue: jest.fn((key) => fakeAPI12Values[key] || ""),
    LMSSetValue: jest.fn(() => true),
    LMSCommit: jest.fn(),
    LMSGetLastError: jest.fn(() => 0),
    LMSGetErrorString: jest.fn(),
    LMSGetDiagnostic: jest.fn(),
  };
}

function initializeAPI2004() {
  window.API_1484_11 = {
    Initialize: jest.fn(() => true),
    Terminate: jest.fn(),
    GetValue: jest.fn((key) => fakeAPI2004Values[key] || ""),
    SetValue: jest.fn(() => true),
    Commit: jest.fn(),
    GetLastError: jest.fn(() => 0),
    GetErrorString: jest.fn(),
    GetDiagnostic: jest.fn(),
  };
}

window.SCORMAdapter = SCORMAdapter;
window.MessageReceiver = MessageReceiver;
const error = window.console.error;

describe("loadContent", () => {
  beforeEach(() => {
    document.documentElement.innerHTML = HTMLGenerator({
      dataSource: "https://www.example.com",
    });
    window.console.error = error;
    delete window.API;
    delete window.API_1484_11;
  });

  test("should call loadContent successfully without an API", () => {
    const mockError = jest.fn();
    window.console.error = mockError;

    loadContent();
    expect(mockError).toHaveBeenCalledTimes(3);

    // Errors are expected because we are not in an lms and the API is not mocked
    expect(mockError.mock.calls).toEqual([
      ["Unable to find an API adapter"],
      ["Couldn't find the API!"],
      [
        "<p>We were not able to contact your LMS: please close this window and try again later.</p>",
      ],
    ]);
  });

  test("should call loadContent successfully with the 1.2 API", () => {
    const mockError = jest.fn();
    window.console.error = mockError;

    initializeAPI12();

    loadContent();
    expect(mockError).not.toHaveBeenCalled();

    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();

    const iframeSrc = iframe?.getAttribute("src");
    expect(iframeSrc).toBe(
      "https://www.example.com/?scorm&learner_id=JohnDoeID&learner_name=John%20Doe&lms_origin=http%3A%2F%2Flocalhost"
    );
  });

  test("should call loadContent successfully with the 2004 API", () => {
    const mockError = jest.fn();
    window.console.error = mockError;

    initializeAPI2004();

    loadContent();
    expect(mockError).not.toHaveBeenCalled();

    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();

    const iframeSrc = iframe?.getAttribute("src");
    expect(iframeSrc).toBe(
      "https://www.example.com/?scorm&learner_id=JohnDoeID&learner_name=John%20Doe&lms_origin=http%3A%2F%2Flocalhost"
    );
  });
});

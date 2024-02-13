import { convertMsToCMITimespan, convertToTimeInterval } from "./SCORMAdapter";

test('convertMsToCMITimespan ("0000:00:00.00")', () => {
  const milliseconds = 36 * 60 * 60 * 1000 + 6 * 60 * 1000 + 2 * 1000 + 23 * 10;
  const CMITimespan = convertMsToCMITimespan(milliseconds);
  expect(CMITimespan).toBe("0036:06:02.23");
});

test("convertToTimeInterval", () => {
  const milliseconds = 36 * 60 * 60 * 1000 + 6 * 60 * 1000 + 2 * 1000 + 23 * 10;
  const timeInterval = convertToTimeInterval(milliseconds);
  expect(timeInterval).toBe("P1DT12H6M2");
});

import dayjs from "dayjs";

export const dateFormat = (value) => {
  return dayjs(value).format("YYYY-MM-DD");
};

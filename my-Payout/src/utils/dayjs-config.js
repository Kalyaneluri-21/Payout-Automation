import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

// Set default timezone to IST since that's what Firestore is using
const IST_TIMEZONE = "Asia/Kolkata";
dayjs.tz.setDefault(IST_TIMEZONE);

export default dayjs;

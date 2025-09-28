/**
 * Converts a time string (HH:MM format) to offset minutes from midnight
 * @param timeString - Time in HH:MM format (e.g., "09:30")
 * @returns Number of minutes from midnight
 */
export const timeStringToOffsetMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
};

/**
 * Converts offset minutes from midnight to a time string (HH:MM format)
 * @param offsetMinutes - Number of minutes from midnight
 * @returns Time string in HH:MM format (e.g., "09:30")
 */
export const offsetMinutesToTimeString = (offsetMinutes: number): string => {
    const hours = Math.floor(offsetMinutes / 60);
    const minutes = offsetMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Formats a time string to display format with AM/PM
 * @param timeString - Time in HH:MM format (e.g., "09:30")
 * @returns Formatted time string (e.g., "9:30 AM")
 */
export const formatTimeDisplay = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Formats offset minutes to display format with AM/PM
 * @param offsetMinutes - Number of minutes from midnight
 * @returns Formatted time string (e.g., "9:30 AM")
 */
export const formatOffsetMinutesToDisplay = (offsetMinutes: number): string => {
    const hours = Math.floor(offsetMinutes / 60);
    const minutes = offsetMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

/**
 * Formats an array of day indices to day names
 * @param days - Array of day indices (0=Sunday, 1=Monday, etc.)
 * @returns Formatted string of day names (e.g., "Mon, Tue, Wed")
 */
export const formatDays = (days: number[]): string => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (!days || days.length === 0) return 'No days selected';
    return days.map(d => dayNames[d]).join(', ');
};
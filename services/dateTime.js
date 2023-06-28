function formatDateTime(dateObj) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
    const dayOfWeek = days[dateObj.getDay()];
    const date = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes();
  
    // Formatting hours and minutes to always appear as two digits
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
  
    // Formatting the date ordinal (st, nd, rd, th)
    let dateOrdinal = 'th';
    if (date === 1 || date === 21 || date === 31) {
        dateOrdinal = 'st';
    } else if (date === 2 || date === 22) {
        dateOrdinal = 'nd';
    } else if (date === 3 || date === 23) {
        dateOrdinal = 'rd';
    }
  
    return `${dayOfWeek}, ${date}${dateOrdinal} ${month} ${year}, ${hours}:${minutes}`;
}

export {
    formatDateTime
}
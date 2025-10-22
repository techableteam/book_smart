export const transformStaffListToMockEvents = (staffList) => {
    const result = {};
    staffList.forEach((staff, index) => {
      const color = `hsl(${(index * 137.5) % 360}, 70%, 50%)`;
  
      staff.shifts.forEach((shift) => {
        const date = shift.date;
        const time = normalizeTimeString(shift.time); // clean unicode arrows & spaces
  
        if (!time) return;
  
        const label = `${staff.firstName} ${staff.lastName}`.slice(0, 12);
        const aic = staff.aic;
        const id = staff.id;
        const shiftId = shift.id;
        const status = shift.status

        if (!result[date]) result[date] = [];
  
        result[date].push({
          label,
          color,
          time,
          aic,
          id,
          shiftId,
          status
        });
      });
    });
  
    return result;
  };

  function normalizeTimeString(rawTime) {
    if (typeof rawTime !== 'string') return '';
    return rawTime
      .replace(/ /g, ' ')      // fix invisible narrow spaces
      .replace(/➜|➔/g, '➔')   // normalize arrow variations
      .trim();
  }
  
export const transformDjobListToMockEvents = async (djobList = []) => {
  const result = {};

  if (!Array.isArray(djobList)) {
    console.error("transformDjobListToMockEvents expects an array");
    return result;
  }

  djobList.forEach((job, index) => {
    const clinicians = job?.clinicianNames ? job?.clinicianNames.split(',') : ["Unknown Clinician"];
    const admins = job?.companyName ? job?.companyName : ["null admin"];
    const degreeName = job?.degreeName ? job?.degreeName : ["null degreeName"];
    const facilities = job?.facilityCompanyName ? job?.facilityCompanyName : ["null facilities"];
    const DJobId = job.DJobId;
    const clinicianId = job.clinicianId;
    const adminId = job.adminId;
    const adminMade = job.adminMade;
    const degreeId = job.degree;
    const facilitiesId = job.facilitiesId;

    const statusColorMap = {
      'NOTSELECT': '#808080', 
      'APPLIED': '#60A5FA',
      'PENDING': '#FFC107',   
      'APPROVED': '#10B981',  
      'REJECTED': '#DC2626',  
      'CANCELLED': '#E5E7EB', 
    };

    const status = normalizeStatus(job?.status); 
    const color = statusColorMap[status] || `hsl(${(index * 137.5) % 360}, 70%, 50%)`; 

    const shifts = job?.shift ? [job.shift] : job?.shifts;

    shifts?.forEach((shift) => {
      const date = shift?.date;
      const time = normalizeTimeString(shift?.time);

      if (!time) return; 

      const jobId = job?.DJobId || job?.id;
      const shiftId = shift?.id;

      // Parse time to check if it's an overnight shift
      const timeRange = parseTimeRange(time);
      const isOvernight = timeRange && timeRange.end <= timeRange.start;

      clinicians.forEach((clinician, clinicianIndex) => {
        const baseEvent = {
          clinicianslabel: clinician.trim(),
          adminsCompanyName: admins,
          degreeName: degreeName,
          facilitiesCompanyName: facilities,
          DJobId: DJobId,
          adminId: adminId,
          adminMade: adminMade,
          degreeId: degreeId,
          facilitiesId: facilitiesId,
          clinicianId: clinicianId,
          color,  
          jobId,
          shiftId,
          status,
          data: { job, shift },
          originalTime: time, // Store original full time for display in modals
        };

        if (isOvernight) {
          // Split overnight shift into two events
          // First part: start date, from start time to midnight
          const startTimeStr = time.split(/[➔➜→\-–—]/)[0]?.trim();
          const firstPartTime = `${startTimeStr} ➔ 12:00 AM`;
          
          if (!result[date]) result[date] = [];
          result[date].push({
            ...baseEvent,
            time: firstPartTime,
            isOvernightPart: 'first',
          });

          // Second part: next date, from midnight to end time
          const endTimeStr = time.split(/[➔➜→\-–—]/)[1]?.trim();
          const nextDate = getNextDateString(date);
          const secondPartTime = `12:00 AM ➔ ${endTimeStr}`;
          
          if (!result[nextDate]) result[nextDate] = [];
          result[nextDate].push({
            ...baseEvent,
            time: secondPartTime,
            isOvernightPart: 'second',
          });
        } else {
          // Regular shift - add to start date only
          if (!result[date]) result[date] = [];
          result[date].push({
            ...baseEvent,
            time,
          });
        }
      });
    });
  });

  return result;
};

function normalizeTimeString(rawTime) {
  if (typeof rawTime !== 'string') return '';
  return rawTime
    .replace(/ /g, ' ')    
    .replace(/➜|➔/g, '➔')
    .trim();
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  const raw = timeStr.replace(/\u202F/g, " ").replace(/\s+/g, " ").trim();
  
  let m = raw.match(/^(\d{1,2}):?(\d{2})$/);
  if (m) {
    const hh = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    if (hh >= 0 && hh < 24 && mm >= 0 && mm < 60) return hh * 60 + mm;
  }
  m = raw.match(/^(\d{1,2}):?(\d{2})\s*([AaPp][Mm])$/);
  if (m) {
    let hh = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    const ampm = m[3].toUpperCase();
    if (hh === 12) hh = 0;
    if (ampm === "PM") hh += 12;
    return hh * 60 + mm;
  }
  m = raw.match(/^(\d{1,2})\s*([AaPp][Mm])$/);
  if (m) {
    let hh = parseInt(m[1], 10);
    const ampm = m[2].toUpperCase();
    if (hh === 12) hh = 0;
    if (ampm === "PM") hh += 12;
    return hh * 60;
  }
  m = raw.match(/^(\d{1,2})$/);
  if (m) {
    const hh = parseInt(m[1], 10);
    if (hh >= 0 && hh < 24) return hh * 60;
  }
  return null;
}

function parseTimeRange(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(/[➔➜→\-–—]/).map((x) => (x || "").trim());
  const start = parseTimeToMinutes(parts[0]);
  const end = parseTimeToMinutes(parts[1]);
  if (start == null || end == null) return null;
  return { start, end };
}

function getNextDateString(dateStr) {
  // Parse date string like "January 11, 2026" and return next day
  try {
    // Try parsing the date string - handle formats like "January 11, 2026"
    let date;
    if (dateStr.includes(',')) {
      // Format: "January 11, 2026"
      const parts = dateStr.split(',');
      if (parts.length === 2) {
        const monthDay = parts[0].trim().split(' ');
        const monthName = monthDay[0];
        const day = parseInt(monthDay[1], 10);
        const year = parseInt(parts[1].trim(), 10);
        
        const monthMap = {
          'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
          'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
        };
        const month = monthMap[monthName];
        if (month !== undefined && !isNaN(day) && !isNaN(year)) {
          date = new Date(year, month, day);
        }
      }
    }
    
    // Fallback to standard Date parsing
    if (!date || isNaN(date.getTime())) {
      date = new Date(dateStr);
    }
    
    if (isNaN(date.getTime())) {
      return dateStr; // Return original if parsing fails
    }
    
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch (e) {
    return dateStr; // Return original if parsing fails
  }
}

const normalizeStatus = (s) => {
  const v = (s || '').toLowerCase().trim();
  if (v === 'notselect') return 'AVAILABLE'; 
  if (v === 'assigned-pending') return 'ASSIGNED-PENDING';
  if (v === 'assigned-approved') return 'ASSIGNED-APPROVED';
  if (v === 'pending') return 'PENDING';
  if (v === 'approved' || v === 'approve' || v === 'accept') return 'APPROVED';
  if (v === 'rejected' || v === 'reject') return 'REJECTED';
  if (v === 'cancelled' || v === 'cancel') return 'CANCELLED';
  return v ? v.toUpperCase() : 'AVAILABLE'; 
};

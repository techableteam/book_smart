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
      'AVAILABLE': '#808080',
      'ASSIGNED-PENDING': '#60A5FA',
      'ASSIGNED-APPROVED': '#34D399',
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
  
        if (!result[date]) result[date] = [];
  
        clinicians.forEach((clinician, clinicianIndex) => {
          result[date].push({
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
            time,
            jobId,
            shiftId,
            status,
            data: { job, shift },
          });
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
  
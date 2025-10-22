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
      'PENDING': '#FFC107',   
      'APPROVED': '#DCFCE7',  
      'REJECTED': '#FEE2E2',  
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
  const v = (s || '').toLowerCase();
  if (v === 'notselect') return 'NOTSELECT'; 
  if (v === 'pending') return 'PENDING';
  if (v === 'accept' || v === 'approved' || v === 'approve') return 'APPROVED';
  if (v === 'reject' || v === 'rejected') return 'REJECTED';
  if (v === 'cancel' || v === 'cancelled') return 'CANCELLED';
  return v ? v.toUpperCase() : 'PENDING'; 
};

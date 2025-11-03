// ReservationForm.tsx (핵심 부분 요약)
const handleSubmit = async () => {
  if (!facility) return;
  const request = {
    facilityId: facility.facilityId,
    wantDate,
    startHour,
    endHour,
    resvPersonCount: personCount,
  };
  try {
    const resvId = await createReservation(request);
    navigate(`/facilities/${id}/reserve/payment?resvId=${resvId}&money=${totalMoney}`);
  } catch {
    alert("예약 신청에 실패했습니다.");
  }
};

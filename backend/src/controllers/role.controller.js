const makeBookingRequest = (req, res) => {
  // Mock action for customer
  res.status(200).json({ 
    status: 'SUCCESS', 
    message: 'Booking request created successfully (Mock)',
    data: req.body 
  });
};

const addStaff = (req, res) => {
  // Mock action for company
  res.status(200).json({ 
    status: 'SUCCESS', 
    message: 'Staff added successfully (Mock)',
    data: req.body 
  });
};

const acceptBooking = (req, res) => {
  // Mock action for worker/staff
  res.status(200).json({ 
    status: 'SUCCESS', 
    message: `Worker accepted booking request ${req.params.id} (Mock)`
  });
};

module.exports = {
  makeBookingRequest,
  addStaff,
  acceptBooking
};

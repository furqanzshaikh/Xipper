const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const yup = require('yup');
const validator = require('validator');

// Define Yup schema for validation
const bookingSchema = yup.object().shape({
    hotelName: yup.string().required('Hotel name is required').min(3, 'Hotel name must be at least 3 characters long'),
    bookingDate: yup.string().required('Booking date is required').typeError('Booking date must be a valid date'),
    checkInDate: yup.string().required('Check-in date is required').typeError('Check-in date must be a valid date')
});

exports.bookHotel = async (req, res) => {
    const { hotelName, bookingDate, checkInDate } = req.body;
    const { userId } = req.user; // Extracted from JWT

    try {
        // Validate request body using Yup
        await bookingSchema.validate({ hotelName, bookingDate, checkInDate }, { abortEarly: false });

        // Sanitize input using validator
        const sanitizedHotelName = validator.escape(validator.trim(hotelName));
        const sanitizedBookingDate = validator.toDate(bookingDate);
        const sanitizedCheckInDate = validator.toDate(checkInDate);

        // Ensure the booking date is before check-in date
        if (new Date(sanitizedBookingDate) > new Date(sanitizedCheckInDate)) {
            return res.status(400).json({ error: 'Check-in date must be after the booking date' });
        }

        // Create the hotel booking in the database
        const booking = await prisma.hotelBooking.create({
            data: {
                hotelName: sanitizedHotelName,
                bookingDate: new Date(sanitizedBookingDate),
                checkInDate: new Date(sanitizedCheckInDate),
                user: { connect: { id: userId } }, // Connects the booking to the user
            },
        });

        res.status(201).json({ message: 'Hotel booked successfully', booking });
    } catch (error) {
        // If Yup validation fails, return a detailed error response
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        
        res.status(500).json({ error: 'Error booking hotel', details: error.message });
    }
};

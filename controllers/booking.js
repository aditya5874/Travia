const Booking = require("../models/booking.js"); // Adjust the path as needed
const Listing = require("../models/listing.js"); // Assuming you have a Listing model

const calculatePrice = (booking, pricePerDay) => {
  return booking.duration * booking.guests * pricePerDay; // Example calculation
};

module.exports.confirmBooking = async (req, res) => {
  try {
    const { bookingDate, guests, duration } = req.body;
    const listingId = req.params.id;

    // Fetch listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).send("Listing not found.");
    }

    const pricePerDay = listing.price;
    const totalPrice = duration * guests * pricePerDay;

    res.render("payment.ejs", {
      bookingData: {
        listingId,
        bookingDate,
        guests,
        duration,
      },
      totalPrice,
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    res.status(500).send("Server error, please try again.");
  }
};

module.exports.confirmPayment = async (req, res) => {
  const { cardNumber, expiryDate, cvv, bookingDate, guests, duration } =
    req.body;
  const listingId = req.params.id;

  try {
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).send("Listing not found.");
    }

    // Check if already booked
    const existingBooking = await Booking.findOne({ listingId, bookingDate });
    if (existingBooking) {
      return res
        .status(400)
        .send("This listing is already booked for the selected date.");
    }

    // Simulate payment success (replace with real payment logic)
    const paymentSuccess = true;
    if (!paymentSuccess) {
      return res.status(400).send("Payment failed.");
    }

    const booking = new Booking({
      listingId,
      bookingDate,
      guests,
      duration,
      userId: req.user._id,
      isPaid: true,
    });

    await booking.save();

    res.send("Payment successful! Booking confirmed.");
  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).send("Payment failed, please try again.");
  }
};

module.exports.showMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all bookings for the logged-in user and populate listing details
    const bookings = await Booking.find({ userId }).populate("listingId");

    res.render("myBookings.ejs", { bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).send("Server error, please try again.");
  }
};

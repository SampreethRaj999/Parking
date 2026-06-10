/**
 * Simulated Notification System
 * In a production environment, this would integrate with services like 
 * SendGrid (Email), Twilio (SMS), or Firebase (Push Notifications).
 */

const sendNotification = (type, target, message) => {
    const timestamp = new Date().toLocaleString();
    console.log(`\n🔔 [NOTIFICATION] [${type.toUpperCase()}]`);
    console.log(`📍 To: ${target}`);
    console.log(`💬 Message: ${message}`);
    console.log(`⏰ Sent at: ${timestamp}\n`);
    
    // Simulate async operation
    return Promise.resolve(true);
};

const sendBookingConfirmation = (userEmail, bookingDetails) => {
    const message = `Booking Confirmed! Slot ${bookingDetails.slotNumber} is reserved for you until ${new Date(bookingDetails.endTime).toLocaleTimeString()}.`;
    return sendNotification('email', userEmail, message);
};

const sendPaymentReceipt = (userEmail, amount, transactionId) => {
    const message = `Payment Received! Amount: $${amount}. Transaction ID: ${transactionId}. Thank you for using ParkSmart.`;
    return sendNotification('email', userEmail, message);
};

module.exports = {
    sendBookingConfirmation,
    sendPaymentReceipt
};

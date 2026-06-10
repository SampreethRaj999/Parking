const Joi = require('joi');

const validateRegistration = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        phoneNumber: Joi.string().min(10).required(),
        role: Joi.string().valid('user', 'staff', 'admin')
    });
    return schema.validate(data);
};

const validateLogin = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });
    return schema.validate(data);
};

const validateBooking = (data) => {
    const schema = Joi.object({
        slot: Joi.string().required(),
        startTime: Joi.date().required(),
        endTime: Joi.date().required(),
        totalAmount: Joi.number().required(),
        vehicleNumber: Joi.string().required()
    });
    return schema.validate(data);
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateBooking
};

const ParkingSlot = require('../models/ParkingSlot');

// @desc    Get all slots
// @route   GET /api/v1/slots
// @access  Public
exports.getSlots = async (req, res, next) => {
    try {
        const slots = await ParkingSlot.find();
        res.status(200).json({ success: true, count: slots.length, data: slots });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single slot
// @route   GET /api/v1/slots/:id
// @access  Public
exports.getSlot = async (req, res, next) => {
    try {
        const slot = await ParkingSlot.findById(req.params.id);
        if (!slot) {
            return res.status(404).json({ success: false, error: 'Slot not found' });
        }
        res.status(200).json({ success: true, data: slot });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new slot
// @route   POST /api/v1/slots
// @access  Private (Admin/Staff)
exports.createSlot = async (req, res, next) => {
    try {
        const slot = await ParkingSlot.create(req.body);
        
        // Emit socket event for real-time update
        const io = req.app.get('io');
        io.emit('slotCreated', slot);

        res.status(201).json({ success: true, data: slot });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update slot
// @route   PUT /api/v1/slots/:id
// @access  Private (Admin/Staff)
exports.updateSlot = async (req, res, next) => {
    try {
        let slot = await ParkingSlot.findById(req.params.id);
        if (!slot) {
            return res.status(404).json({ success: false, error: 'Slot not found' });
        }

        slot = await ParkingSlot.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Emit socket event for real-time update
        const io = req.app.get('io');
        io.emit('slotUpdated', slot);

        res.status(200).json({ success: true, data: slot });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete slot
// @route   DELETE /api/v1/slots/:id
// @access  Private (Admin)
exports.deleteSlot = async (req, res, next) => {
    try {
        const slot = await ParkingSlot.findById(req.params.id);
        if (!slot) {
            return res.status(404).json({ success: false, error: 'Slot not found' });
        }

        await slot.deleteOne();

        // Emit socket event for real-time update
        const io = req.app.get('io');
        io.emit('slotDeleted', req.params.id);

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

const express = require('express');
const router = express.Router();
const { createLead, getLeads, updateLead, logPhoneView, createPublicReferral, handleGoogleFormWebhook } = require('../controllers/leadController');
const { verifyWebhook, receiveWebhook } = require('../controllers/fbController');
const { protect } = require('../middleware/authMiddleware');

// Public Route
router.post('/public-referral', createPublicReferral);
router.post('/google-form-webhook', handleGoogleFormWebhook);

// Facebook Webhook Routes (Public)
router.get('/facebook/webhook', verifyWebhook);
router.post('/facebook/webhook', receiveWebhook);

router.route('/')
  .post(protect, createLead)
  .get(protect, getLeads);

router.route('/:id')
  .patch(protect, updateLead);

router.post('/:id/log-view-phone', protect, logPhoneView);

module.exports = router;

-- Seed tickets
INSERT INTO tickets (
    id, email_id, title, body, category, priority, confidence, suggested_action,
    reasoning, requires_human_review, status, created_at, sla_deadline, resolved_at,
    corrected_category, corrected_priority, agent_notes, society_name,
    extracted_location, extracted_asset_id
) VALUES 
(
    'TCK-9401', 'em_849201', 
    'URGENT: Physical tampering detected on Locker #302', 
    'Hi Secure Manager team, I walked down to our society locker bank in Block B and noticed scratches and tool marks around the lock bezel of locker #302. The keypad response is lagging. Please inspect immediately as my valuables are stored inside.', 
    'security_concern', 'urgent', 0.96, 
    'Dispatch field engineer immediately & notify security lead for physical inspection.', 
    'Subject and body contain clear indicators of physical tampering and potential security breach on a locker asset.', 
    FALSE, 'resolved', NOW() - INTERVAL '15 minutes', NOW(), NOW(),
    NULL, NULL, NULL, 'Oakridge Greens', 
    'Block B Locker Bank, Basement 1', 'LCK-302-B'
),
(
    'TCK-9402', 'em_849202', 
    'Locked out! App code not generating and passport inside', 
    'I am at the locker right now trying to retrieve my passport for an early morning flight. The app says ''Connection Error'' when generating OTP code. Please help me unlock it urgent!', 
    'locker_access', 'urgent', 0.92, 
    'Trigger remote master override after verifying resident KYC phone prompt.', 
    'User is physically stranded at locker with time-sensitive access failure (passport retrieval for flight).', 
    FALSE, 'resolved', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '10 minutes', NOW(),
    NULL, NULL, NULL, 'Sunview Heights', 
    'Tower 4 Main Lobby', 'LCK-108-A'
),
(
    'TCK-9403', 'em_849203', 
    'Mere locker ka gate jam ho gaya hai light flashing fast', 
    'Locker number 405 ka door thoda bent hai, jab button daba rahe hai to yellow light blinks but lock open nahi ho raha. Pls check kardo.', 
    'locker_access', 'high', 0.58, 
    'Assign maintenance crew to inspect door alignment & lock solenoid.', 
    'Hinglish description of hardware door jam and LED code signal. Confidence low due to code-mixed phrasing.', 
    FALSE, 'resolved', NOW() - INTERVAL '40 minutes', NOW() + INTERVAL '20 minutes', NOW(),
    NULL, NULL, NULL, 'Palms Residency', 
    'Clubhouse Annex', 'LCK-405-C'
),
(
    'TCK-9404', 'em_849204', 
    'Double charge on monthly subscription invoice #INV-882', 
    'I noticed my bank statement shows two debits of ₹499 on July 24th for Secure Manager Premium Locker plan. Kindly process a refund for the duplicate transaction.', 
    'billing_payment', 'medium', 0.98, 
    'Verify billing ledger for duplicate charge #INV-882 and initiate payment gateway refund.', 
    'Standard billing dispute with explicit invoice ID provided.', 
    FALSE, 'resolved', NOW() - INTERVAL '180 minutes', NOW() + INTERVAL '60 minutes', NOW() - INTERVAL '30 minutes',
    NULL, NULL, 'Refund processed via Razorpay reference #RF-9912.', 'Eminent Towers', 
    'N/A', 'INV-882'
),
(
    'TCK-9405', 'em_849205', 
    'Ownership transfer request for Flat 802 Secure Manager slot', 
    'We sold our apartment in Royal Palms and moving out next week. New owner details attached. Please update ownership record on account.', 
    'account_kyc', 'medium', 0.91, 
    'Send KYC re-verification form to incoming resident email.', 
    'Account management request for tenancy/ownership transfer.', 
    FALSE, 'resolved', NOW() - INTERVAL '110 minutes', NOW() + INTERVAL '130 minutes', NOW(),
    NULL, NULL, NULL, 'Royal Palms', 
    'Tower 2 - Flat 802', 'ACC-8812'
),
(
    'TCK-9406', 'em_849206', 
    'Request for additional locker installation in Tower C', 
    'Greetings from Society RWA Committee. Our residents love the Secure Manager facility in Tower A and B. Can we schedule a site survey to install 10 additional units in Tower C?', 
    'facility_request', 'low', 0.95, 
    'Forward inquiry to Expansion & Account Manager for society site visit.', 
    'Society-level expansion inquiry from RWA committee.', 
    FALSE, 'resolved', NOW() - INTERVAL '300 minutes', NOW() + INTERVAL '1140 minutes', NOW(),
    NULL, NULL, NULL, 'Oakridge Greens', 
    'Tower C Ground Floor', 'N/A'
)
ON CONFLICT (id) DO NOTHING;

-- Seed telemetry
INSERT INTO telemetry (ticket_id, event_type, message, level, created_at)
VALUES 
('TCK-9401', 'CLASSIFICATION_ALERT', 'Rule Safety Net forced Urgent priority due to tamper keywords.', 'warning', NOW() - INTERVAL '15 minutes'),
('TCK-9402', 'LLM_CLASSIFY_SUCCESS', 'Gemini 2.5 classified email em_849202 as locker_access (92% confidence).', 'info', NOW() - INTERVAL '25 minutes'),
('TCK-9403', 'FLAGGED_HUMAN_REVIEW', 'Confidence (0.58) below threshold (0.70). Sent to human queue.', 'warning', NOW() - INTERVAL '40 minutes'),
('TCK-9404', 'TICKET_RESOLVED', 'Agent approved billing refund suggestion.', 'success', NOW() - INTERVAL '30 minutes');

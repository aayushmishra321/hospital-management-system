const auditService = require('../services/auditService');

/* ================================
   AUDIT MIDDLEWARE
================================ */
const auditMiddleware = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    const startTime = Date.now();

    // Override res.send to capture response
    res.send = function(data) {
      const responseTime = Date.now() - startTime;
      
      // Log the audit event
      if (req.user) {
        const metadata = {
          statusCode: res.statusCode,
          responseTime,
          requestBody: req.body,
          requestParams: req.params,
          requestQuery: req.query
        };

        // Determine success based on status code
        const success = res.statusCode >= 200 && res.statusCode < 400;

        // Add error message if failed
        if (!success && data) {
          try {
            const responseData = JSON.parse(data);
            metadata.errorMessage = responseData.message || 'Unknown error';
          } catch (e) {
            metadata.errorMessage = 'Response parsing failed';
          }
        }

        // Determine severity based on action and success
        let severity = auditService.severity.LOW;
        if (!success) {
          severity = auditService.severity.HIGH;
        } else if (['DELETE', 'ADMIN_ACTION'].includes(action)) {
          severity = auditService.severity.MEDIUM;
        }

        // Determine category
        let category = auditService.category.USER;
        if (req.user.role === 'admin') {
          category = auditService.category.ADMIN;
        } else if (['LOGIN', 'LOGOUT', 'PASSWORD_CHANGE'].includes(action)) {
          category = auditService.category.SECURITY;
        }

        auditService.log({
          userId: req.user.id,
          action,
          resource,
          resourceId: req.params.id || req.params.patientId || req.params.doctorId || null,
          metadata,
          severity,
          category,
          description: `${action} operation on ${resource}`,
          success,
          req
        }).catch(err => {
          console.error('Audit logging failed:', err);
        });
      }

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};

/* ================================
   SPECIFIC AUDIT MIDDLEWARES
================================ */
const auditLogin = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    const success = res.statusCode === 200;
    let userId = null;

    if (success && data) {
      try {
        const responseData = JSON.parse(data);
        userId = responseData.user?.id;
      } catch (e) {
        // Ignore parsing errors
      }
    }

    // Log login attempt
    auditService.logLogin(userId, req, success).catch(err => {
      console.error('Login audit logging failed:', err);
    });

    originalSend.call(this, data);
  };

  next();
};

const auditLogout = async (req, res, next) => {
  if (req.user) {
    auditService.logLogout(req.user.id, req).catch(err => {
      console.error('Logout audit logging failed:', err);
    });
  }
  next();
};

const auditPasswordChange = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    const success = res.statusCode === 200;
    
    if (req.user) {
      auditService.logPasswordChange(req.user.id, req, success).catch(err => {
        console.error('Password change audit logging failed:', err);
      });
    }

    originalSend.call(this, data);
  };

  next();
};

const auditFileUpload = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    const success = res.statusCode === 200;
    
    if (req.user && success && req.files) {
      req.files.forEach(file => {
        auditService.logFileUpload(req.user.id, null, {
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        }, req).catch(err => {
          console.error('File upload audit logging failed:', err);
        });
      });
    }

    originalSend.call(this, data);
  };

  next();
};

const auditPayment = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    const success = res.statusCode === 200;
    
    if (req.user) {
      auditService.logPayment(req.user.id, {
        amount: req.body.amount,
        billingId: req.body.billingId,
        paymentMethod: req.body.paymentMethod
      }, req, success).catch(err => {
        console.error('Payment audit logging failed:', err);
      });
    }

    originalSend.call(this, data);
  };

  next();
};

module.exports = {
  auditMiddleware,
  auditLogin,
  auditLogout,
  auditPasswordChange,
  auditFileUpload,
  auditPayment
};
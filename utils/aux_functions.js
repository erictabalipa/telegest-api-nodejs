const Permission = require('../models/permission');

async function checkPermission(userPermissions, permissionNeeded) {
  try {
    await Permission.findById(userPermissions)
      .then(perms => {
        let check = false;
        perms.permissions.forEach(perm => {
          if (perm == permissionNeeded) {
            check = true;
          }
        })
        if (!check) {
          const error = new Error("You don't have permission to do this.");
          error.statusCode = 401;
          throw error;
        } else { return true; }
      })
      .catch (err => {
        if (typeof err.statusCode == 'undefined') {
          const error = new Error('Error fetching permissions in database.');
          error.statusCode = 500;
          throw error;
        }
        throw err;
      });
  } catch (err) {
    throw err;
  }
}

module.exports.checkPermission = checkPermission;
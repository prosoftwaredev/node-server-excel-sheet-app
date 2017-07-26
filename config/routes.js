const users = require('../controllers/users');
const company = require('../controllers/company');
const sheets = require('../controllers/sheets');
const user_groups = require('../controllers/user_groups');
const records = require('../controllers/records');
const attachments = require('../controllers/attachments');
const recordFields = require('../controllers/record_fields');
const seeds = require('../controllers/seeds');
const images = require('../controllers/images');
const files = require('../controllers/files');
const resetPassword = require('../controllers/resetPassword');
const cors = require('cors');
const controllerUtils = require('../utils/controller_utils');

const GET = 'GET';
const POST = 'POST';
const OPTIONS = 'OPTIONS';
const USE = 'USE';

module.exports = function (express, app, passport) {

  const requireAnyAuth = passport.authenticate('jwt', {
    session: false
  });

  const requireUserAuth = passport.authenticate('user-jwt', {
    session: false
  });

  const requireAdminAuth = passport.authenticate('admin-jwt', {
    session: false
  });

  const requireAnyLogin = passport.authenticate('local', {
    session: false
  });

  const requireUserLogin = passport.authenticate('user-local', {
    session: false
  });

  const requireAdminLogin = passport.authenticate('admin-local', {
    session: false
  });

  let corsOptions = {
    methods: 'GET,POST,OPTIONS',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials',
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  };

  let publicCorsOptions = corsOptions;
  publicCorsOptions.origin = '*';

  let privateCorsOptions = publicCorsOptions;
  privateCorsOptions.origin = process.env.WEB_APP_CORS_ORIGIN;

  let v1 = express.Router();

  if (app.get('env') === 'development') {
    loadDevOnlyRoutes(v1);
  }

  v1.options('/user/login', cors(publicCorsOptions));
  v1.post('/user/login', requireUserLogin, users.login);

  v1.options('/admin/login', cors(privateCorsOptions));
  v1.post('/admin/login', cors(privateCorsOptions), requireAdminLogin, users.login);

  loadPublicRoutes(v1, cors(publicCorsOptions));
  loadUserRoutes(v1, cors(publicCorsOptions), requireUserAuth);
  loadAdminRoutes(v1, cors(privateCorsOptions), requireAdminAuth);
  loadSharedRoutes(v1, cors(publicCorsOptions), requireAnyAuth);

  app.use('/v1', v1);
  app.use('/', v1); // Set the default version to latest.

  function loadSharedRoutes(router, corsMiddleware, authMiddleware) {

    const routes = [
      {
        path: '/protected/profile_images',
        method: USE,
        handler: express.static('uploads/profile_images')
      },
      {
        path: '/images',
        method: POST,
        handler: [images.imageUploadHandler, images.uploadCallback]
      },
      {
        path: '/file/upload',
        method: POST,
        handler: [files.uploadHandler, files.uploadCallback]
      },
      {
        path: '/file',
        method: GET,
        handler: files.get
      },
      {
        path: '/file/download',
        method: GET,
        handler: files.download
      },
      {
        path: '/file/sheet',
        method: GET,
        handler: files.sheetFiles
      },
      {
        path: '/file/update',
        method: POST,
        handler: files.update
      },
      {
        path: '/file/processCSV',
        method: POST,
        handler: files.processCSV
      },
      {
        path: '/file/delete',
        method: POST,
        handler: files.deleteFile
      },
      {
        path: '/sheet/create',
        method: POST,
        handler: sheets.create
      },
      {
        path: '/sheet/all',
        method: GET,
        handler: sheets.index
      },
      {
        path: '/sheet',
        method: GET,
        handler: sheets.get
      },
      {
        path: '/sheet.csv',
        method: GET,
        handler: sheets.getCSV
      },
      {
        path: '/sheet/update',
        method: POST,
        handler: sheets.update
      },
      {
        path: '/sheet/delete',
        method: POST,
        handler: sheets.deleteSheet
      },
      {
        path: '/field/create',
        method: POST,
        handler: recordFields.create
      },
      {
        path: '/field',
        method: GET,
        handler: recordFields.get
      },
      {
        path: '/field/update',
        method: POST,
        handler: recordFields.update
      },
      {
        path: '/field/delete',
        method: POST,
        handler: recordFields.deleteRecordField
      },
      {
        path: '/record/create',
        method: POST,
        handler: records.create
      },
      {
        path: '/record',
        method: GET,
        handler: records.get
      },
      {
        path: '/record/update',
        method: POST,
        handler: records.update
      },
      {
        path: '/record/delete',
        method: POST,
        handler: records.deleteRecord
      },
      {
        path: '/record/deleteMulti',
        method: POST,
        handler: records.deleteMultipleRecords
      },
      {
        path: '/attachment/create',
        method: POST,
        handler: attachments.create
      },
      {
        path: '/attachment',
        method: GET,
        handler: attachments.get
      },
      {
        path: '/attachment/update',
        method: POST,
        handler: attachments.update
      },
      {
        path: '/attachment/delete',
        method: POST,
        handler: attachments.deleteAttachment
      },
    ];

    routes.forEach(function (routeSpec) {
      router.options(routeSpec.path, corsMiddleware);
      mountRouteBySpec(router, routeSpec, [corsMiddleware, authMiddleware])
    });
  }

  function loadPublicRoutes(router, corsMiddleware) {

    const routes = [
      {
        path: '/user/resetPassword',
        method: POST,
        handler: users.resetPassword
      },
      {
        path: '/user/hasSetPass',
        method: GET,
        handler: users.checkFirstPass
      },
      {
        path: '/password/reset',
        method: POST,
        handler: resetPassword.postReset
      },
      {
        path: '/company',
        method: GET,
        handler: company.get
      },
    ];

    routes.forEach(function (routeSpec) {
      router.options(routeSpec.path, corsMiddleware);
      mountRouteBySpec(router, routeSpec, [corsMiddleware])
    });

  }

  function loadUserRoutes(router, corsMiddleware, authMiddleware) {

    const routes = [
      {
        path: '/user/logout',
        method: POST,
        handler: users.logout
      },
      {
        path: '/user/authCheck',
        method: POST,
        handler: controllerUtils.genericHandler
      },
      {
        path: '/user/lookup',
        method: GET,
        handler: users.lookupUsers
      },
    ];

    routes.forEach(function (routeSpec) {
      router.options(routeSpec.path, corsMiddleware);
      mountRouteBySpec(router, routeSpec, [corsMiddleware, authMiddleware])
    });

  }

  function loadAdminRoutes(router, corsMiddleware, authMiddleware) {

    const routes = [
      {
        path: '/admin/authCheck',
        method: POST,
        handler: controllerUtils.genericHandler
      },
      {
        path: '/user/all',
        method: GET,
        handler: users.adminGetAllUsers
      },
      {
        path: '/user/info',
        method: GET,
        handler: users.adminGetUserInfo
      },
      {
        path: '/user/update',
        method: POST,
        handler: users.updateUser
      },
      {
        path: '/user/delete',
        method: POST,
        handler: users.deleteUser
      },
      {
        path: '/user/disable',
        method: POST,
        handler: users.disableUser
      },
      {
        path: '/user/enable',
        method: POST,
        handler: users.enableUser
      },
      {
        path: '/user/create',
        method: POST,
        handler: users.createUser
      },
      {
        path: '/admin/create',
        method: POST,
        handler: users.createAdmin
      },
      {
        path: '/user/resendInvite',
        method: POST,
        handler: users.resendInvite
      },
      {
        path: '/admin/images',
        method: POST,
        handler: [images.imageUploadHandler, images.adminUploadCallback]
      },
      {
        path: '/company/update',
        method: POST,
        handler: company.update
      },
      {
        path: '/company/image',
        method: POST,
        handler: [images.imageUploadHandler, company.companyImageUploadCallback]
      },
      {
        path: '/group/create',
        method: POST,
        handler: user_groups.create
      },
      {
        path: '/group/all',
        method: GET,
        handler: user_groups.index
      },
      {
        path: '/group',
        method: GET,
        handler: user_groups.get
      },
      {
        path: '/group/update',
        method: POST,
        handler: user_groups.update
      },
      {
        path: '/group/addMember',
        method: POST,
        handler: user_groups.addMember
      },
      {
        path: '/group/removeMember',
        method: POST,
        handler: user_groups.removeMember
      },
      {
        path: '/group/addMembersToGroup',
        method: POST,
        handler: user_groups.addMultipleMembersToGroup
      },
      {
        path: '/group/addUserToGroups',
        method: POST,
        handler: user_groups.addSingleMemberToMultipleGroups
      },
      {
        path: '/group/delete',
        method: POST,
        handler: user_groups.deleteUserGroup
      },
      {
        path: '/sheet/addGroup',
        method: POST,
        handler: sheets.addGroup
      },
      {
        path: '/sheet/removeGroup',
        method: POST,
        handler: sheets.removeGroup
      },
    ];

    routes.forEach(function (routeSpec) {
      router.options(routeSpec.path, corsMiddleware);
      mountRouteBySpec(router, routeSpec, [corsMiddleware, authMiddleware])
    });

  }

  function loadDevOnlyRoutes(router) {
    console.log('mounting development only API routes');

    // router.use('/', index);
    router.get('/reset', resetPassword.getResetPassword);
    router.post('/seedAdmin', seeds.seedAdmin);
    router.post('/seedCompany', requireAdminAuth, seeds.seedCompany);
    router.post('/seed', requireAdminAuth, seeds.seed);
  }

  function mountRouteBySpec(router, routeSpec, middlewareArray) {
    try {
      switch (routeSpec.method) {
        case GET:
          router.get(routeSpec.path, middlewareArray, routeSpec.handler);
          break;
        case POST:
          router.post(routeSpec.path, middlewareArray, routeSpec.handler);
          break;
        case USE:
          router.use(routeSpec.path, middlewareArray, routeSpec.handler);
          break;
        default:
          console.log('unmatched methods in routeSpec: ', routeSpec);
      }
    } catch (e) {
      console.log('error mounting route: ', e);
      console.log('routeSpec: ', routeSpec);
      console.log('middlewareArray: ', middlewareArray);
    }
  }

};

const AUTH = require('../config/auth');
const TEAM_CONTROLLER = require('../controllers/team');

module.exports = (APP) => {

    // TEAM
    APP.get('/team', AUTH.isAuth, TEAM_CONTROLLER.get);
    APP.post('/team', AUTH.isAuth, TEAM_CONTROLLER.create);
    APP.put('/team/:teamId', AUTH.isAuth, TEAM_CONTROLLER.update);
    APP.delete('/team/:teamId', AUTH.isAuth, TEAM_CONTROLLER.delete);
}
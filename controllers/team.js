const VALIDATOR = require('validator');
const TEAM = require('mongoose').model('Team');
const HELPER = require('../utilities/helper');
const HTTP = require('../utilities/http');

const PAGE_LIMIT = 15;

module.exports = {

    get: (req, res) => {
        let userId = HELPER.getAuthUserId(req);
        console.log(userId)

        TEAM.find({ "members.user": userId })
            // .populate('User')
            .then((team) => {
                return HTTP.success(res, team);
            })
            .catch(err => HTTP.handleError(res, err));
    },

    create: (req, res) => {
        let team = req.body;

        TEAM.create(team).then((newTeam) => {
            return HTTP.success(res, newTeam, 'Team created successfully!');
        }).catch(err => HTTP.handleError(res, err));
    },

    update: (req, res) => {
        let teamId = req.params.teamId;
        let editedTeam = req.body;

        TEAM.findById(teamId).then((team) => {
            if (!team) return HTTP.error(res, 'There is no team with the given id in our database.');

            team.name = editedTeam.name;
            team.members = editedTeam.members;
            team.save();

            return HTTP.success(res, team, 'Team edited successfully!');
        }).catch(err => HTTP.handleError(res, err));
    },

    delete: (req, res) => {
        let teamId = req.params.teamId;

        TEAM.findByIdAndRemove(teamId).then((deletedTeam) => {
            if (!deletedTeam) return HTTP.error(res, 'There is no team with the given id in our database.');

            return HTTP.success(res, deletedTeam, 'Team deleted successfully!');
        }).catch(err => HTTP.handleError(res, err));
    },
};
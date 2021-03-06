
const Redis = require('./lib/redisManager');
const GetUserByUserName = require('./lib/UserManager').GetUserByUsernameInternal;

let redis = new Redis();

module.exports = () => {

    return function (req, res, next) {

        let email = req.user.sub;
        let project = parseInt(req.user.company);
        let workspace = parseInt(req.user.tenant);

        let key = `srn:${email}:${project}:${workspace}`;

        redis.GetSession(key).then(function (value) {

            if (value !== null && value !== 'null') {

                if (value === true || value === "true") {
                    next()
                } else {
                    next(new Error('Value is ' + value + '. User is unauthorized'));
                }

            } else {

                GetUserByUserName(req, (user) => {

                    let User = JSON.parse(user);

                    if ((User.IsSuccess === true || User.IsSuccess === 'true') && User.Result !== null) {

                        let WorkSpaces = User.Result.workspaces;
                        let Projects = User.Result.projects;

                        let workspacesExist = WorkSpaces.filter((WorkSpace) => {
                            return (WorkSpace.workspaceId.toString() === workspace.toString());
                        });

                        let projectExist = Projects.filter((Project) => {
                            return (Project.projectId.toString() === project.toString());
                        });

                        if (workspacesExist.length !== 0 && projectExist.length !== 0) {

                            redis.SetSession(key, true).then(function (value) {
                                next()
                            }).catch(function (ex) {
                                console.log('Exception thrown when calling set session method: ' + ex);
                                next(new Error('Exception thrown when calling set session method'));
                            });

                        } else {

                            redis.SetSession(key, false).then(function (value) {

                            }).catch(function (ex) {
                                console.log('Exception thrown when calling set session method: ' + ex);
                                //next(new Error('Error'));
                            });
                            next(new Error('Data of the user does not contain the given workspace or project. User is Unauthorized'));
                        }
                    } else {
                        next(new Error('User not found or user data retrieving has failed'));
                    }
                })
            }
        }).catch(function (ex) {
            console.log('Exception thrown when calling get session method: ' + ex);
            next(new Error('Exception thrown when calling get session method'));
        });
    };
};
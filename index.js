const rp = require('request-promise');
const jar = rp.jar();
const _ = require('lodash');

module.exports = function ConnectWiseControl(instanceUrl, username, password) {
    {
        var module = {};
        var headers = null;

        /*
            Get agent download as buffer.
        */
        module.getAgentDownload = async (organization) => {
            await this.getWebSession();

            return await this.getAgentDownload(organization);
        }

        /*
            Gets the entire list of sessions from ConnectWise Control.
        */
        module.getSessionGroups = async () => {
            await this.getWebSession();

            return await this.getSessionGroups();
        };

        /*
            Often times the session groups are used for clients and it'd be easiest to sort them alphabetically.
        */
        module.sortSessionGroups = async () => {
            await this.getWebSession();

            var groups = await this.getSessionGroups();

            groups = _.orderBy(groups, 'Name', 'asc');

            await this.saveSessionGroups(groups);
        };

        /**
         * @param {string} organization - The new organizations name.
        */

        module.createSessionGroup = async (organization) => {
            await this.getWebSession();

            var groups = await this.getSessionGroups();

            var existingGroups = groups.filter(group => group.Name === organization);

            // Making sure the group doesn't already exist
            if (existingGroups.length === 0) {
                groups.push({
                    Name: organization,
                    SessionFilter: `CustomProperty1='${organization}'`,
                    SessionType: 2,
                    SubgroupExpressions: ''
                });

                // Resorting alphabetically
                groups = _.orderBy(groups, 'Name', 'asc');

                console.log(JSON.stringify(groups));
                await this.saveSessionGroups(groups);
            } else {
                throw new Error('The session group you specified already exists.');
            }
        };

        /**
         * @param { integer } id - The session group's ID.
         */

        /*
            The actual POST request requires the entire list of sessions. We'll be 
            modifying a single group and sending the entire list back for simplicity.
        */
        module.renameSessionGroup = async (oldName, newName) => {
            await this.getWebSession();

            let groups = await this.getSessionGroups();

            var updatedGroups = groups.map(group => {
                if (group.Name === oldName) {
                    group.Name = newName;
                }
            });

            await this.saveSessionGroups(updatedGroups);
        };

        /**
         * @param {string} organization - The organization you want the agent to be assigned to.
         */
        getAgentDownload = async (organization) => {
            let params = {
                method: 'POST',
                uri: `${instanceUrl}/Services/ExtensionService.ashx/GetInstanceUserInfo`,
                jar,
                json: true
            };

            const instanceInfo = await rp(params); // Gets the instance key

            params.uri = `${instanceUrl}/Services/LicenseService.ashx/GetLicenseInfo`;

            const licenseInfo = await rp(params); // Gets the license ID which helps generate the relay host

            const instanceKey = instanceInfo.publicKey;
            const instance = `instance-${licenseInfo.LicenseRuntimeInfos[0].LicenseID}-relay.screenconnect.com`; // For now.

            // Resetting params for agent download
            params = {
                method: 'GET',
                uri: `${instanceUrl}/Bin/ConnectWiseControl.ClientSetup.msi`,
                qs: {
                    h: instance,
                    p: '443',
                    k: instanceKey,
                    e: 'Access',
                    y: 'Guest',
                    t: '',
                    c: organization
                },
                jar,
                encoding: null,
                resolveWithFullResponse: true
            };

            const res = await rp(params); // Downloading the file

            return res.body; // Should be the buffer of the file
        }

        getSessionGroups = async () => {
            const params = {
                method: 'POST',
                uri: `${instanceUrl}/Services/SessionGroupService.ashx/GetSessionGroups`,
                jar,
                json: true
            };

            const groups = await rp(params);

            return groups;
        }

        // /*
        //     Gets a list of computers in the specified session group.
        // */

        // /**
        //  * @param {string} session - 'Session Group'
        // */
        // getHostSessions = async () => {
        //     // Specifiy session and possibly page number to get list of computers. Pick only certain attributes and get the company name.
        // }

        /**
         * @param {group[]} groups - Groups based on getSessionGroups
         */
        saveSessionGroups = async (groups) => {
            let body = [];

            body.push(groups); // For some stupid reason. Control has an array inside of an array.

            // Sending in the entire list with the updated group.
            const params = {
                method: 'POST',
                uri: `${instanceUrl}/Services/SessionGroupService.ashx/SaveSessionGroups`,
                body: body,
                jar,
                json: true
            };

            await rp(params);
        }

        /*
            Signs into the web service and sets the cookie.
        */
        getWebSession = async () => {
            if (!headers) { // Only set to determine if we've already logged in.

                const params = {
                    method: 'POST',
                    uri: `${instanceUrl}/Login?Reason=7`,
                    form: {
                        __VIEWSTATE: '/wEPDwUKMTM5ODA0NTQ4MA8WAh4TVmFsaWRhdGVSZXF1ZXN0TW9kZQIBFgJmD2QWBAIBD2QWAgIFDxYCHgRocmVmBUp+L0FwcF9UaGVtZXMvQ292aS9EZWZhdWx0LmNzcz9fX0NhY2hlPWVjOWZlZWRlLWJkN2MtNGQ0My05N2EzLWE5ZTI4NGJjOGM0NWQCAw9kFgICAQ9kFgZmDw8WAh4EVGV4dAVBWW91IGhhdmUgYmVlbiBsb2dnZWQgb3V0IG9mIHRoZSBzeXN0ZW0uIFBsZWFzZSBsb2dpbiB0byBjb250aW51ZS5kZAIBD2QWAmYPZBYCAgUPDw9kFgIeDGF1dG9jb21wbGV0ZQUDb2ZmZWQCBA9kFgJmDxYCHgtfIUl0ZW1Db3VudAIBFgJmD2QWAgIBDw8WBB4PQ29tbWFuZEFyZ3VtZW50BSQxYzM4NGVhNS04OTA2LTRlN2MtOTFjZS1mZjYwN2ViMTQyZTcfAgUVQ29ubmVjdCB3aXRoIE9uZUxvZ2luZGQYAQUUY3RsMDAkTWFpbiRtdWx0aVZpZXcPD2RmZAPfLlxFPzGXFeqly4Xb5GuTABj3SOpY5ZP2tKamFxBQ',
                        __VIEWSTATEGENERATOR: '48701E03',
                        ctl00$Main$userNameBox: username,
                        ctl00$Main$passwordBox: password,
                        ctl00$Main$ctl05: 'Login'
                    },
                    jar,
                    resolveWithFullResponse: true,
                    simple: false
                };

                let res = await rp(params);

                // Setting so the rest of the application can use it.
                headers = res.headers;
            }
        };

        return module;
    }
}
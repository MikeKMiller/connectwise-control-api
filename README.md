# ConnectWise Control API

_Note: This library is in no way affiliated with ConnectWise._

This module is intended to help manage ConnectWise Control resources programmatically. Since there is no official API, this essentially interfaces with the front-end web interface to login, get a cookie and run commands that appear to be run in the web browser. The original intent of this library was to be able to create an interface to automatically create and update session groups based on companies in ConnectWise Manage, but it can be used for anything.

# Future Features

The goal is include all of the features available in the web interface such as running commands, downloading agents, etc.

# Requirements

This project uses async/await, so I'd recommend using NodeJS 8.11.2 (LTS).

# Getting Started

In your project's folder, run `npm i connectwise-control-api --save`. Then, in your project, include the following:

```
const cc = require('connectwise-control-api')('https://yourinstance.screenconnect.com', 'user@domain.com', 'ReallyGoodPassword');
```

# Functions

## Get Session Groups

`await cc.getSessionGroups();`

### Example Response

```
[
    {
      "Name": "Fun Client",
      "SessionFilter": "CustomProperty1='Fun Client'",
      "SessionType": 2,
      "SubgroupExpressions": ""
    },
    {
      "Name": "Boring Client",
      "SessionFilter": "CustomProperty1='Boring Client'",
      "SessionType": 2,
      "SubgroupExpressions": ""
    },
    {
      "Name": "Doesn't Pay Their Bills Client",
      "SessionFilter": "CustomProperty1='Doesn't Pay Their Bills Client'",
      "SessionType": 2,
      "SubgroupExpressions": ""
    }
]
```

## Sort Session Groups Alphabetically

`await cc.sortSessionGroups();`

## Create a Session Group

`await cc.createSessionGroup('Your New Group')`

## Rename a Session Group

`await cc.renameSessionGroup('Old Session Name', 'New Session Name');`

### Example Response

No response.

## Get an Agent MSI as a Buffer

`await cc.getAgentDownload(organizationname);`

### Example Response

This function returns of a buffer of the agent's MSI download. You could pass this to NodeJS's `fs` module for downloading like this:

```
const fs = require('fs');

var buffer = await cc.getAgentDownload('Your Organization');
fs.writeFileSync('Your Organization.msi', buffer);
```
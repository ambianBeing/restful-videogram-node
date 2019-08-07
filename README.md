# restful-videogram-node

Restful APIs in node &amp; express with OAuth2 and persistence in mongodb
**The RESTful APIs will be listening on port 5000**

## Getting Started

It covers ["GET", "POST", "DELETE", "PATCH"] requests for the scenario of resource CRUD operations **VIDEOS**.
Following instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

**-NOTE:** Javascript ES6 syntax has been use throughout.

### Prerequisites

1.Nodejs with NPM and mongoDb on 27017 should be installed on the target machine to get the app up & running.

2.Get [Google OAuth2](https://console.developers.google.com/apis/dashboard) credentials from google api console. Used as primary strategy for passport for user login.

3.In a terminal/cmd do the following basic checks

```
mongo --version
node -v
npm -v
```

### Installing

A step by step to get a development env running.

## Project dependencies

```
1. open terminal/cmd in project root
2. npm install
```

-Google credential configs are in **config/auth-keys.js** with dummy values. Update that w.r.t yours.

-User session details are maintained using passport and cookie-session in tandem with express routes. A random `String` as cookie key is required, place it in **auth-keys.js** file.

```
  google: {
    clientID:<CLIENT_ID>,
    clientSecret: <CLIENT_SECRET>
  },
  session: {
    cookieKey: <COOKIE-KEY_STRING> //any random string
  }
};
```

-Mongodb connection URI settings and server main port: Are located at **config/base-config.js**

```
const MONGODB_CONNECTION_CONF = {
  uri: "mongodb://<HOST>:<PORT>/<DB_NAME>", //change this URL <mongodb://YOUR_MONGO_CONTAINER:EXPOSED_MONGO_PORT/DB_NAME> when dockerizing
  params: {
    useNewUrlParser: true,
    useFindAndModify: false,
    autoIndex: false,
    reconnectTries: 50,
    reconnectInterval: 5000,
    poolSize: 20,
    connectTimeoutMS: 10000
  }
};

const SERVER_BASE_PORT = <PORT_YOU_WISH>;
```

## Running the tests

```
POSTMAN/CURL
```

### Seeding the database

```

```

## Running the app

```
npm run dev

npm run prod
```

## File upload mechanism

- disk storage for multer component is used here and uploaded files go into **src/video-uploads/**
- Hence this directory needs to be present at relevant path for upload to work
- Files are firt uploaded via multer then preocessed via **ffmpeg** to crop and replaced in the same directory.
- Processed files are renamed with combinations("encd" + uniqueId + timeStamp) to maintain uniqueness.

## Api Interface

- The api interfaces are divided into two parts **auth-routes : <HOST>/auth/provider** and **user-routes : <HOST>/user/api**
- To access any of the user apis one must login or register first time using **<HOST>/auth/google** which is going to ask google credentials.
- Example: go to http://localhost:5000/auth/google --> fill credentials --> redirect to home --> test user APIs http://localhost:5000/upload-video/

### User routes

#### System user can upload a video

- Method: `POST`
- URL path: `user/upload-video`
- Request body:

  ```
  <form
      action="/user/upload-video"
      enctype="multipart/form-data"
      method="POST"
    >
      <legend>Upload Video</legend>
      <input type="file" name="userVideo" />
      <button type="submit" class="btn btn-primary">Upload</button>
    </form>
  ```

- Response:

  Header: `HTTP 200`
  Body:

  ```
  {
      isError: false,
      errMsg: null,
      payload: "success"
    };
  ```

  or

  Header: `HTTP <HTTP_CODE>`
  Body:

  ```
  {
      isError: true,
      errMsg: <ERROR_MESSGAGE>,
      payload: []
    };
  ```

- Requirements:

  - User must be logged in or first time used must be register using auth routes **locahost:5000/auth/google/**.
  - Upload a file via form having name attribute as <userVideo> mandatory.

#### Get any video file by ID

- Method: `GET`
- URL path: `/get-video?id=xyz`
- Request body:

  ```

  ```

- Response:
  Header: `HTTP 200`
  Body:

  ```
  Will download the requested file in the browser
  ```

  or

  Header: `HTTP <HTTP_CODE>`
  Body:

  ```
  {
      isError: true,
      errMsg: <ERROR_MESSGAGE>,
      payload: []
    };
  ```

- Info:

  - If download is not required and simple JSON of file info can be sent from the respective method in service file **services/user-service.js**.

#### Delete video and comments

- Method: `DELETE`
- Url path: `/delete-video`
- Request:
  Body:

  ```
  {id:<ID_OF_REQUESTED_VIDEO>}
  ```

- Response:
  Header: `HTTP 200`
  Body:

  ```
  {
      isError: false,
      errMsg: null,
      payload: "success"
    };
  ```

  or

  Header: `HTTP <HTTP_CODE>` Body:

  ```
  {
      isError: true,
      errMsg: <ERROR_MESSGAGE>,
      payload: []
    };
  ```

#### Get all vidoes uploaded to the system

- Method: `GET`
- Url path: `/get-video-list?page=x&limit=y`
- Request:
  Body:

  ```

  ```

- Response:
  Header: `HTTP 200`
  Body:

  ```
  {
      isError: false,
      errMsg: null,
      payload: {
            "id": "5d4a9a27a0509948c28fe4ab",
            "name": "SampleVideo_1280x720_1mb.mp4",
            "uploadedAt": "2019-08-07T09:30:15.113Z",
            "comments": [
                {
                    "_id": "5d4af1830d704e773113fa24",
                    "content": "this video is default fantastic",
                    "creatorName": "ambianBeing",
                    "createdAt": "2019-08-07T15:42:59.384Z"
                }
                ...
            ]
        },
        ...
    };
  ```

  or

  Header: `HTTP <HTTP_CODE>` Body:

  ```
  {
      isError: true,
      errMsg: <ERROR_MESSGAGE>,
      payload: []
    };
  ```

  - Info:

  - Page and limit are query params in the URL for pagination.

#### Get all vidoes uploaded to the system by a user

- Method: `GET`
- Url path: `/get-user-videos?id=xyz&page=x&limit=y`
- Request:
  Body:

  ```

  ```

- Response:
  Header: `HTTP 200`
  Body:

  ```
  {
      isError: false,
      errMsg: null,
      payload: {
            "id": "5d4a9a27a0509948c28fe4ab",
            "name": "SampleVideo_1280x720_1mb.mp4",
            "uploadedAt": "2019-08-07T09:30:15.113Z",
            "comments": [
                {
                    "_id": "5d4af1830d704e773113fa24",
                    "content": "this video is default fantastic",
                    "creatorName": "ambianBeing",
                    "createdAt": "2019-08-07T15:42:59.384Z"
                }
                ...
            ]
        },
        ...
    };
  ```

  or

  Header: `HTTP <HTTP_CODE>` Body:

  ```
  {
      isError: true,
      errMsg: <ERROR_MESSGAGE>,
      payload: []
    };
  ```

  - Info:

  - id is userId and Page,limit are query params in the URL for pagination.

#### User can comment on any video

- Method: `PATCH`
- Url path: `/comment-on-video/:id`
- Request:
  Body:

  ```
  {
      content: <COMMENT_TEXT>
  }

  ```

- Response:
  Header: `HTTP 200`
  Body:

  ```
  {
      isError: false,
      errMsg: null,
      payload: "success"
    };
  ```

  or

  Header: `HTTP <HTTP_CODE>` Body:

  ```
  {
      isError: true,
      errMsg: <ERROR_MESSGAGE>,
      payload: []
    };
  ```

  - Info:

  - id is video id in URL and content of comment is body params.

#### User can get list of comments on a video

- Method: `GET`
- Url path: `/get-video-comments?id=xyz&page=x&limit=y`
- Request:
  Body:

  ```

  ```

- Response:
  Header: `HTTP 200`
  Body:

  ```
  {
    "isError": false,
    "errMsg": null,
    "payload": [
        {
            "content": "This video is awesome",
            "creatorName": "YZX",
            "createdAt": "2019-08-07T17:02:12.196Z"
        },
        {
            "content": "factor in everything",
            "creatorName": "AmbianBeing",
            "createdAt": "2019-08-07T17:02:27.220Z"
        }
        ...
    ]
  };
  ```

  or

  Header: `HTTP <HTTP_CODE>` Body:

  ```
  {
      isError: true,
      errMsg: <ERROR_MESSGAGE>,
      payload: []
    };
  ```

  - Info:

  - valid videoId and commentId should be passed in request body.

#### User can delete own comments

- Method: `DELETE`
- Url path: `/delete-comments`
- Request:
  Body:

  ```
  {
    videoId:<VIDEO_ID>,
    commentId:<COMMENT_TO_DELETE_ID>
  }

  ```

- Response:
  Header: `HTTP 200`
  Body:

  ```
  {
      isError: false,
      errMsg: null,
      payload: "success"
    };
  ```

  or

  Header: `HTTP <HTTP_CODE>` Body:

  ```
  {
      isError: true,
      errMsg: <ERROR_MESSGAGE>,
      payload: []
    };
  ```

  - Info:

  - valid videoId and commentId should be passed in request body.

## Built With

- [Nodejs with express](https://nodejs.org/en/download/) - The framework used for backend apis
- [NPM](https://www.npmjs.com/get-npm) - Dependency Management
- [Mongodb with mongoose ODM](https://docs.mongodb.com/manual/installation/) - As data persistence
- [Passport](http://www.passportjs.org/) -For Oauth2 integration with google strategy
- [Mocha-Chai](https://www.chaijs.com/) - For writing test cases

## Contributing

## Versioning

## Authors

- **ambianBeing**

## License

## Acknowledgments

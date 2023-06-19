CREATE TABLE if not exists allTweet (
            tweetId integer not null primary key autoincrement,
            authorId integer not null,
            authorName text not null,
            isATweet int not null,
            message text not null,
            nblikes int not null,
            date text not null,
            nbcomments int not null,
            idTweetReply int not null
        );
CREATE TABLE if not exists users (
            id integer not null primary key autoincrement,
            email text not null,
            pseudo text not null,
            username text not null,
            password text not null,
            profilePicture text not null,
            bio text not null,
            nbFollower int not null,
            nbFollowing int not null
        );
CREATE TABLE if not exists likes (
            tweetId integer not null,
            authorId integer not null
        );
CREATE TABLE if not exists follow (
            authorId integer not null,
            userToFollow integer not null
        );
# BookClub Server - Built with Node, Express and Postgres

## Description

A community/discussion-first approach to discussing books, inspired by [Reddit](http://reddit.com/) and [goodreads](https://www.goodreads.com/)

The frontend for this project can be viewed [here](https://bookclub-web.vercel.app)

The backend is hosted on heroku.

## User stories for this project

- As a user, I would like to register on this website so that I can sign in to my account.

- As a user, I would like to sign in to my account so that I can get a customized feed for posts from bookclubs I have subscribed to.

- As a user, I would like to view posts from bookclubs within the website so that I can find posts I am interested in.

- As a user, I would like to view posts from bookclubs I have subscribed to so that I get posts that I am already interested in.

- As a user, I would like to upvote a post so that I can show my support for posts I like.

- As a user, I would like to downvote a post so that I can show dislike for posts I don't like.

- As a user, I would like to create bookclubs so that I can find people of similar interest.

- As a user, I would like to join bookclubs so that I can get content that appeals to me.

- As a user, I would like to leave bookclubs so that I don't get content I am no longer interested in.

- As a user, I would like to create post to a community so that it can be seen by members of the same community.

- As a user, I would like to delete posts I have created so that I can have more control over the content I put out.

- As a user, I would like to update posts I have created so that I can have more control over the content I put out.

- As a user, I would like to comment on posts so that I can express my opinion on posts.

- As a user, I would like to upvote a comment to show support for the opinion expressed.

- As a user, I would like to downvote a comment to express dislike for thoughts presented in a comment.

- As a user I would like to delete a comment I created to have more control on content I put out.

## How I handled authentication

This project uses JSON Web Tokens (JWTs) to authenticate requests. During sign in or sign up, the a jwt token is sent to the client, which stores the token in local storage. In its subsequent requests, the client retrieves the token and appends it to the requests, which are then authenticated by the server. The tokens are only valid for 4 hrs.

## Getting started

Clone the repository:

`git clone https://github.com/JrFelix540/bookclub-web.git`

Enter the project directory

`cd bookclub-web`

Install NPM dependencies:

`npm i`

Set environment variables

- `NEXT_PUBLIC_API_URI` - GraphQL API address

Run the development server:

`npm run dev`

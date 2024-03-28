const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');
const fs = require('fs');

// create an image post
router.post('/', async (req, res) => {
  let checkUrl = req.body.img.split("https");
  let isUrl = false;

  if (checkUrl[0].length < 1) {
    isUrl = true;
  }

  base64_encode = (file) => {
    return "data:image/jpeg;base64,"+fs.readFileSync(file, 'base64');
  }

  var base64str = req.body.img;

  if (!isUrl) {
    base64str = base64_encode(`/usercode/image_sharing_app/api/public/images/${req.body.img}`);
  }

  const newPost = new Post({
    userId: req.body.userId,
    desc: req.body.desc,
    img: base64str,
  });

  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get a single image post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get all posts of a user
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({username: req.params.username});
    const posts = await Post.find({userId: user._id});
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get timeline posts
router.get('/timeline/:userId', async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);

    const userPosts = await Post.find({userId: currentUser._id});

    const followedUserPosts = await Promise.all(
      currentUser.followings.map((followingId) => {
        return Post.find({userId: followingId});
      })
    );
      
    res.status(200).json(userPosts.concat(...followedUserPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
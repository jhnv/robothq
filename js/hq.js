$(function() {

/* ----------------- MODELS ---------------- */

  var Post = StackMob.Model.extend({
    schemaName: 'post'
  });
 

/* ----------------- COLLECTIONS ---------------- */

  var PostList = StackMob.Collection.extend({
    model: Post
  });

/* ----------------- VIEWS ---------------- */

  var PostView = Backbone.View.extend({
    
    tagName: 'div', // name of (orphan) root tag in this.el
    className: 'post',    
    template: _.template($('#post-template').html()),

    initialize: function(){
      _.bindAll(this, 'render'); // every function that uses 'this' as the current object should be in here
    },
    
    render: function(){          
      this.$el.html(this.template(this.model.toJSON()));
      return this; // for chainable calls, like .render().el
    }
  
  });
  
  var PostListView = Backbone.View.extend({
    
    el: $('.posts-container'), //attach to .container
    
    events: {
      'click button#add': 'addPost'
    },
    
    template: _.template($('#postList-template').html()),
    
    initialize: function(){
      
      var self = this;
      _.bindAll(this, 'render', 'addPost', 'appendPost');

      // RETRIEVE COLLECTION INSERT STACKMOB CODE
      initialPosts = new PostList();
      initialPosts.fetch({
        success: function(posts) {          

          // assign to instance var
          self.collection = posts;

          // collection event binder
          self.collection.bind('add', self.appendPost);
      
          // render this view automatically
          self.render();

        },
        error: function(model, response) {
          console.debug("curses! we have failed, Hobbes!");
        }
      });
      
    },
    
    render: function(){
      
      var self = this;
      var $posts,
        collection = this.collection;

      // in this case loading the template even though no data is being generated
      // by passing in this.template
      $(this.el).html(this.template({}));

      // shortcut for the class='albums' element in the HTML. By using this as a prefix, 
      // jQuery will scope down and only search within
      // this objects elements instead of the whole document
      $posts = this.$('ul');

      collection.each(function (post) {
        
        // for each post create a new view, pass in the model and collection
        var view = new PostView({
          model: post,
          collection: collection
        });
        // call the view's render method and append to DOM
        $posts.append(view.render().el);
        
      });

      return this; // return for additional chaining...
    
    },
    
    addPost: function(){
      var self = this;
      content = $('textarea').val();
      
      // get the highest current post numeric "URL"
      var numQuery = new StackMob.Collection.Query();
      numQuery.orderDesc('num').setRange(0, 10);
      
      var postNums = new PostList();
      postNums.query(numQuery, {
        success: function(collection) {
          
          newPostNum = collection.at(0).get('num') + 1;

          // create the new post, save to StackMob
          if(content !== '') {

            var post = new Post({
              content: content,
              num: newPostNum
            });

            post.create({
              success: function(model) {

                // what'd we get back?
                console.debug('ID is: ' + model.get('post_id'));
                console.debug('Post num is: ' + model.get('num'));
                console.debug('Content is: ' + model.get('content'));

                
                // add to collection
                self.collection.add(post); 
              }
            });

          } else {
            alert('Woops, enter some content!');
          } // close check for content

        },
        error: function () {
          console.log("Unable to fetch new post num.");
          return false;
        }

      });

    },

    appendPost: function(post){
      var postView = new PostView({
        model: post
      });
      $('ul', this.el).append(postView.render().el);
    }    

  });



/* ----------------- ROUTES ---------------- */

  var HQ = Backbone.Router.extend({

    routes: {
      '': 'home',
      'post/:num': 'post',  // #post/num
    },

    home: function() {

      // create view
      window.postListView = new PostListView();
    
    },

    post: function(num) {
      // empty posts div. must be better ways to clear templates
      $('.posts').empty();
      window.indivPostView = new PostView();
    }

  });

new HQ();
Backbone.history.start({pushState: false});
  
});
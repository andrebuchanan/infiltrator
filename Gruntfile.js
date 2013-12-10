var env = require("./env.json");
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    env: {
      src: "env.json"
    },
    mochacli: {
      options: {
        require: ["should"]
      },
      server: ["test/server/*Spec.js"]
    },
    karma: {
      unit: {
        configFile: "test/karma.conf.js"
      }
    },
    watch: {
      test: {
        files: ["test/**/*Spec.js"],
        tasks: ["mochacli"]
      }
    },
    nodemon: {
      dev: {
        options: {
          env: env,
          args: ["8888"],
          watchedFolders: ["./lib"]
        }
      },
      test: {
        options: {
          env: env,
          args: ["8889"],
          watchedFolders: ["./lib"]
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-mocha-cli");
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default", ["watch"]);
  grunt.registerTask("test", ["nodemon:test", "mochacli"]);
  grunt.registerTask("serve", ["nodemon:dev"]);
};
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    mochacli: {
      options: {
        require: ["should"]
      },
      all: ["test/server/*Spec.js"]
    },
    karma: {
      unit: {
        configFile: "test/karma.conf.js"
      }
    },
    watch: {
      files: ["test/**/*Spec.js"],
      tasks: ["mochacli", "karma"]
    }
  });

  grunt.loadNpmTasks("grunt-mocha-cli");
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks("grunt-contrib-watch");

  // Default task(s).
  grunt.registerTask("test", ["mochacli", "karma"]);
};
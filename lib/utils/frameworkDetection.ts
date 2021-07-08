const detectFramework = () => {
  const result: string[] = [];
  if (
    !!(window as any).React
    || !!document.querySelector("[data-reactroot], [data-reactid]")
  ) result.push("React");

  if (
    !!(window as any).angular
    || !!document.querySelector(
      ".ng-binding, [ng-app], [data-ng-app], [ng-controller], [data-ng-controller], [ng-repeat], [data-ng-repeat]",
    )
    || !!document.querySelector(
      'script[src*="angular.js"], script[src*="angular.min.js"]',
    )
  ) result.push("Angular.js");

  if ((window as any).Backbone) result.push("Backbone.js");
  if ((window as any).Ember) result.push("Ember.js");
  if ((window as any).Vue) result.push("Vue.js");
  if ((window as any).Meteor) result.push("Meteor.js");
  if ((window as any).Zepto) result.push("Zepto.js");
  if ((window as any).jQuery) result.push("jQuery.js");

  return result;
};

export default detectFramework;

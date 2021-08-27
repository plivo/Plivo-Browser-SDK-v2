const detectFramework = () => {
  const detectReact = () => {
    const all = document.querySelectorAll('*');
    for (let i = 0; i < all.length; i += 1) {
      if (/react/.test(all[i] as unknown as string) || /React/.test(all[i] as unknown as string)) return true;
    }

    return false;
  };
  const result: string[] = [];
  if (
    !!(window as any).React
    || !!document.querySelector("[data-reactroot], [data-reactid]") || detectReact()
  ) result.push("React");

  if (
    !!(window as any).angular
    || !!document.querySelector(
      ".ng-binding, [ng-app], [data-ng-app], [ng-controller], [data-ng-controller], [ng-repeat], [ng-version], [data-ng-repeat]",
    )
    || !!document.querySelector(
      'script[src*="angular.js"], script[src*="angular.min.js"]',
    )
  ) result.push("Angular.js");

  if ((window as any).Backbone) result.push("Backbone.js");
  if ((window as any).Ember) result.push("Ember.js");
  if ((window as any).Vue) result.push("Vue.js");
  if ((window as any).Meteor) result.push("Meteor.js");
  if ((window as any).jQuery) result.push("jQuery.js");

  return result;
};

export default detectFramework;

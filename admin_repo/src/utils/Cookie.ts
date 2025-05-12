const Cookie = {
  getCookie(name: string) {
    let v = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
    return v ? decodeURIComponent(v[2]) : null;
  },

  setCookie(name: string, value: string, days: any) {
    let d = new Date();
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * parseInt(days));
    document.cookie =
      name +
      "=" +
      encodeURIComponent(value) +
      ";path=/;expires=" +
      d.toUTCString();
  },

  deleteCookie(name: string) {
    this.setCookie(name, "", -1);
  },
};

export default Cookie;

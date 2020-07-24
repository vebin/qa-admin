import request from "@/utils/request";

export function login(data) {
  return request({
    url: "/api/login",
    method: "post",
    data,
  });
}

export function logout() {
  return request({
    url: "/api/logout",
    method: "post",
  });
}

export function getInfo(token) {
  return request({
    url: "/api/user/info",
    method: "get",
    params: { token },
  });
}

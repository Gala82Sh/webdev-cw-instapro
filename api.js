// Замени на свой, чтобы получить независимый от других набор данных.
const personalKey = "prod";
const baseHost = "https://wedev-api.sky.pro";
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;

export function getPosts({ token }) {
  return fetch(postsHost, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }
      return response.json();
    })
    .then((data) => {
      return data.posts;
    });
}

export function registerUser({ login, password, name, imageUrl }) {
  return fetch(baseHost + "/api/user", {
    method: "POST",
   
    body: JSON.stringify({
      login,
      password,
      name,
      imageUrl,
    }),
  }).then((response) => {
    if (response.status === 400) {
      return response.json().then(data => {
        throw new Error(data.error || "Такой пользователь уже существует");
      });
    }
    return response.json();
  });
}

export function loginUser({ login, password }) {
  return fetch(baseHost + "/api/user/login", {
    method: "POST",
    
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    if (response.status === 400) {
      return response.json().then(data => {
        throw new Error(data.error || "Неверный логин или пароль");
      });
    }
    return response.json();
  });
}

export function uploadImage({ file }) {
  const data = new FormData();
  data.append("file", file);

  return fetch(baseHost + "/api/upload/image", {
    method: "POST",
    body: data,
  }).then((response) => {
    return response.json();
  });
}

export function createPost({ token, description, imageUrl }) {
  const postData = {
    description: description || "",
    imageUrl: imageUrl || ""
  };
  
  console.log("Отправляю данные:", postData);
  
  return fetch(postsHost, {
    method: "POST",
    headers: {
      Authorization: token,
    },
    body: JSON.stringify(postData)
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        console.error("Ошибка сервера:", text);
        throw new Error(`Ошибка ${response.status}: ${text}`);
      });
    }
    return response.json();
  });
}

export function toggleLike({ token, postId }) {
  return fetch(`${postsHost}/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }
      if (!response.ok) {
        throw new Error("Ошибка при изменении лайка");
      }
      return response.json();
    });
}

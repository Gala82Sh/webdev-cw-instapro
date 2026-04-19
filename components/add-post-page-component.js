import { renderHeaderComponent } from "./header-component.js";
import { uploadImage } from "../api.js";

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  let imageUrl = "";
  let isUploading = false;

  const render = () => {
    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="add-post-container">
          <h2>Добавить новый пост</h2>
          
          <div class="add-post-form">
            <div class="upload-image-container"></div>
            
            <div class="form-group">
              <label for="post-description">Описание:</label>
              <textarea 
                id="post-description" 
                class="post-description-input" 
                rows="3" 
                placeholder="Напишите что-нибудь..."
              ></textarea>
            </div>
            
            <button class="button" id="publish-button" disabled>Опубликовать</button>
          </div>
        </div>
      </div>
    `;

    appEl.innerHTML = appHtml;

    
    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });

   
    const uploadImageContainer = document.querySelector(".upload-image-container");
    
   
    const tempDiv = document.createElement('div');
    import("./upload-image-component.js").then(module => {
      module.renderUploadImageComponent({
        element: uploadImageContainer,
        onImageUrlChange: (url) => {
          imageUrl = url;
          const publishButton = document.getElementById("publish-button");
          if (publishButton) {
            publishButton.disabled = !imageUrl || isUploading;
          }
        },
        onUploadStart: () => {
          isUploading = true;
          const publishButton = document.getElementById("publish-button");
          if (publishButton) {
            publishButton.disabled = true;
            publishButton.textContent = "Загрузка...";
          }
        },
        onUploadEnd: () => {
          isUploading = false;
          const publishButton = document.getElementById("publish-button");
          if (publishButton) {
            publishButton.disabled = !imageUrl;
            publishButton.textContent = "Опубликовать";
          }
        }
      });
    });

   
    const publishButton = document.getElementById("publish-button");
    if (publishButton) {
      publishButton.addEventListener("click", () => {
        const descriptionTextarea = document.getElementById("post-description");
        const description = descriptionTextarea ? descriptionTextarea.value : "";
        
        if (!imageUrl) {
          alert("Пожалуйста, загрузите изображение");
          return;
        }
        
        onAddPostClick({
          description: description,
          imageUrl: imageUrl,
        });
      });
    }
  };

  render();
}

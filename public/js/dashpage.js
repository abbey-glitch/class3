let main = document.getElementById("main");
let createBlog = document.getElementById("createBlog");
createBlog.addEventListener("click", (e) => {
    e.preventDefault();
    main.innerHTML = `<form method="POST" id="blogForm" enctype="multipart/form-data" action="/adminblog">
        <div class="mb-3">
            <label for="title" class="form-label">Title</label>
            <input type="text" class="form-control" id="title" placeholder="Enter blog title" name="title">
            <span id="titleErr"></span>
        </div>
        <div class="mb-3">
            <input type="file" name="imgupload">
        </div>
        <select class="form-select" aria-label="Default select example" name="category">
            <option selected>Choose Blog Category</option>
            <option value="technology" name="category">Technology</option>
            <option value="project" name="projects">Project</option>
            <option value="news" name="news">News</option>
            
        </select>
        <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <textarea class="form-control" placeholder="Enter blog description" id="description" name="description" rows="5"></textarea>
            <span id="autherr"></span>
        </div>
        <div class="mb-3">
            <label for="author" class="form-label">Author Name</label>
            <input type="text" class="form-control" id="author" placeholder="Enter blog author" name="blogauthor">
            <span id="autherr"></span>
        </div>
         <div class="mb-3">
            <label for="title" class="form-label">Author Number</label>
            <input type="number" class="form-control" id="number" placeholder="Enter author number" name="number">
            <span id="autherr"></span>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
    </form>`;
    console.log(e);
})

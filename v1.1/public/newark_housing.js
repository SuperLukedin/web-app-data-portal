function initViz() {
    var containerDiv = document.getElementById("newark_housing"),
    url = "https://public.tableau.com/views/newark_housing_0/newark_housing?:embed=y&:display_count=yes";
        
    var viz = new tableau.Viz(containerDiv, url); 
}
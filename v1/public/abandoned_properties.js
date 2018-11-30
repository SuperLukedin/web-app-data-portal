function initViz() {
    var containerDiv = document.getElementById("abandoned_properties"),
    url = "https://public.tableau.com/views/ab_4/BarChart?:embed=y&:display_count=yes";
        
    var viz = new tableau.Viz(containerDiv, url); 
}
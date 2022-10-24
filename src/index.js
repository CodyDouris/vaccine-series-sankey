d3.csv("./data/sankeyDiagramVaccineSeries.csv").then(function(data) {
  let numberFormat = d3.format(",d");
  const margin = { top: 1, right: 10, bottom: 6, left: 10 };
  const width = 1140 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const formatNumber = d3.format(',d');
  const format = d => `${formatNumber(d)}`;
  const color = d3.scaleOrdinal(["#b2182b", "#ef8a62", "#fddbc7", "#ffffbf", "#d1e5f0", "#67a9cf", "#2166ac"]);//["#7cbe70", "#40918d", "#bbe141", "#3c8e99", "#457799", "#7bd269", "#49be86"]

  let svg;

  let canvas;

  const sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(15)
    .size([width, height]);

  const path = sankey.link();

  let seriesPause = true;
  let currId;
  let nodes;
  let links;
  let masterJson;
  let ptNumSelection;
  createSankeySeriesData("1");

  function createSankeySeriesData(ptSelection) {
    //assembling the data into a readable JSON
    ptNumSelection = ptSelection;
    currId = 0;
    nodes = {};
    links = {};
    masterJson = { "nodes": [], "links": [] };
    data.forEach(function(element, index) {
      if ((element.pruid == ptSelection) && (element.reportdate == data[0].reportdate)) {
        if (nodes[element["primary_series"] + " Primary"] == undefined) {
          nodes[element["primary_series"] + " Primary"] = currId;
          masterJson["nodes"].push({ "name": element["primary_series"] + " Primary", "id": currId });
          currId = currId + 1;
        }
        if (nodes[element["first_additional_vaccine"] + " 1st Additional"] == undefined) {
          nodes[element["first_additional_vaccine"] + " 1st Additional"] = currId;
          masterJson["nodes"].push({ "name": element["first_additional_vaccine"] + " 1st Additional", "id": currId, "totalComingIn": 0 });
          currId = currId + 1;
        }
        if (nodes[element["second_additional_vaccine"] + " 2nd Additional"] == undefined) {
          nodes[element["second_additional_vaccine"] + " 2nd Additional"] = currId;
          masterJson["nodes"].push({ "name": element["second_additional_vaccine"] + " 2nd Additional", "id": currId, "totalComingIn": 0 });
          currId = currId + 1;
        }
        if (links[element["primary_series"] + " Primary" + "=>" + element["first_additional_vaccine"] + " 1st Additional"] == undefined) {
          links[element["primary_series"] + " Primary" + "=>" + element["first_additional_vaccine"] + " 1st Additional"] = element["primary_series_completed"];
          masterJson["links"].push({
            "source": nodes[element["primary_series"] + " Primary"],
            "target": nodes[element["first_additional_vaccine"] + " 1st Additional"],
            "value": element["primary_series_completed"].replace(",", "").replace(",", ""),
            "label": element["primary_series_completed"],
            "id": (nodes[element["primary_series"] + " Primary"] + "=>" + nodes[element["first_additional_vaccine"] + " 1st Additional"])
          })
        }
        else
          masterJson["links"].forEach(function(d) {
            if (d["source"] == nodes[element["primary_series"] + " Primary"] &&
              d["target"] == nodes[element["first_additional_vaccine"] + " 1st Additional"]) {
              let newVal = Number(d["value"]) + Number(element["primary_series_completed"].replace(",", "").replace(",", ""));

              d["value"] = newVal;
              d["label"] = newVal;
            }
          });
        if (links[element["first_additional_vaccine"] + " 1st Additional" + "=>" + element["second_additional_vaccine"] + " 2nd Additional"] == undefined) { //&& (element["first_additional_vaccine"] !== "Have not received an additional dose")
          links[element["first_additional_vaccine"] + " 1st Additional" + "=>" + element["second_additional_vaccine"] + " 2nd Additional"] = element["primary_series_completed"];
          masterJson["links"].push({
            "source": nodes[element["first_additional_vaccine"] + " 1st Additional"],
            "target": nodes[element["second_additional_vaccine"] + " 2nd Additional"],
            "value": element["primary_series_completed"].replace(",", "").replace(",", ""),
            "label": element["primary_series_completed"],
            "id": (nodes[element["first_additional_vaccine"] + " 1st Additional"] + "=>" + nodes[element["second_additional_vaccine"] + " 2nd Additional"])
          })
        }
        else
          masterJson["links"].forEach(function(d) {
            if (d["source"] == nodes[element["first_additional_vaccine"] + " 1st Additional"] &&
              d["target"] == nodes[element["second_additional_vaccine"] + " 2nd Additional"]) {
              let newVal = Number(d["value"]) + Number(element["primary_series_completed"].replace(",", "").replace(",", ""));

              d["value"] = newVal;
              d["label"] = newVal;
            }
          });
      }
    });
    console.log("Vaccine Series:");
    console.log(masterJson);
    createSeriesSankey();
  }

  function createSeriesSankey() {
    seriesPause = true;

    svg = d3.select('#sankeyAreaSeries').append("svg")
      .attr('viewBox', '0 0 928 600')
      .attr('preserveAspectRatio', 'xMinYMin')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('id', 'sankeySeriesSVG')
      .style('position', 'absolute')
      .style("opacity", 0)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    canvas = d3.select("#sankeyAreaSeries").append("canvas")
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('id', "sankeySeriesCanvas")
      .style("pointer-events", "none")
      .style("opacity", 0);

    d3.select("#sankeySeriesSVG").transition().duration(800).style("opacity", 1);
    d3.select("#sankeySeriesCanvas").transition().duration(800).style("opacity", 1);

    sankey
      .nodes(masterJson.nodes)
      .links(masterJson.links)
      .layout(0);

    let table = d3.select("#tableBody");
    
    let tablePrimary = d3.select("#tableBodyPrimary");
    let tableAdditional = d3.select("#tableBodyAdditional");
    
    table.html("");
    
    tablePrimary.html("");
    tableAdditional.html("");
    
    let seriesPrimaryArray = [
    "Pfizer-BioNTech Comirnaty Primary", 
    "Moderna Spikevax Primary", 
    "mRNA mixed series Primary", 
    "AstraZeneca Vaxzevria/COVISHIELD-mRNA mixed series Primary", 
    "AstraZeneca Vaxzevria/COVISHIELD Primary", 
    "All other series Primary", 
    "Have not received Primary", 
    "Not reported Primary"];
    seriesPrimaryArray.forEach(seriesName => {
      let totalSeries = masterJson.nodes.filter(d => d.name.includes(seriesName));
      let totalLinks = masterJson.links;

      if (seriesName == "mRNA mixed series")
        totalSeries.pop();
      else if (seriesName == "AstraZeneca Vaxzevria/COVISHIELD")
        totalSeries.shift();
        
      let total = totalSeries.find(d => d.name.includes("Primary"));
      
      let pizer = totalLinks.filter(d => d.source.name.includes(seriesName));
      let pizerFirstAdd = pizer.find(d => d.target.name == "Pfizer-BioNTech Comirnaty 1st Additional");

      let moderna = totalLinks.filter(d => d.target.name.includes("Moderna Spikevax") && d.source.name.includes(seriesName));
      let modernaFirstAdd = moderna.find(d => d.target.name == "Moderna Spikevax 1st Additional");

      let mRNA = totalLinks.filter(d => d.target.name == "mRNA mixed series" && d.source.name.includes(seriesName));
      let mRNAFirstAdd = mRNA.find(d => d.target.name == "mRNA mixed series 1st Additional");

      let astraZenecaVaxzevriaCOVISHIELDmRNA = totalLinks.filter(d => d.target.name == "AstraZeneca Vaxzevria/COVISHIELD-mRNA mixed series" && d.source.name.includes(seriesName));
      let astraZenecaVaxzevriaCOVISHIELDmRNAFirstAdd = astraZenecaVaxzevriaCOVISHIELDmRNA.find(d => d.target.name == "AstraZeneca Vaxzevria/COVISHIELD-mRNA mixed series 1st Additional");

      let astraZenecaVaxzevriaCOVISHIELD = totalLinks.filter(d => d.target.name == "AstraZeneca Vaxzevria/COVISHIELD" && d.source.name.includes(seriesName));
      let astraZenecaVaxzevriaCOVISHIELDFirstAdd = astraZenecaVaxzevriaCOVISHIELD.find(d => d.target.name == "AstraZeneca Vaxzevria/COVISHIELD 1st Additional");

      let allOtherSeries = totalLinks.filter(d => d.target.name.includes("All other series") && d.source.name.includes(seriesName));
      let allOtherSeriesFirstAdd = allOtherSeries.find(d => d.target.name == "All other series 1st Additional");

      let haveNotReceived = totalLinks.filter(d => d.target.name.includes("2nd") && d.source.name.includes(seriesName));
      let haveNotReceivedFirstAdd = haveNotReceived.find(d => d.target.name == "Moderna Spikevax 1st Additional");

      let notReported = totalLinks.filter(d => d.target.name.includes("Not reported") && d.source.name.includes(seriesName));
      let notReportedFirstAdd = notReported.find(d => d.target.name == "Not reported 1st Additional");

      tablePrimary.append("tr").html(
        "<td>" + (seriesName == "Have not recieved" ? seriesName + " an additional dose" : seriesName) +
        "</td><td>" + (total == undefined ? "N/A" : numberFormat(total.value)) +
        "</td><td>" + (pizerFirstAdd == undefined ? "N/A" : numberFormat(pizerFirstAdd.value)) +
        "</td><td>" + (modernaFirstAdd == undefined ? "N/A" : numberFormat(modernaFirstAdd.value)) +
        "</td><td>" + (mRNAFirstAdd == undefined ? "N/A" : numberFormat(mRNAFirstAdd.value)) +
        "</td><td>" + (astraZenecaVaxzevriaCOVISHIELDmRNAFirstAdd == undefined ? "N/A" : numberFormat(astraZenecaVaxzevriaCOVISHIELDmRNAFirstAdd.value)) +
        "</td><td>" + (astraZenecaVaxzevriaCOVISHIELDFirstAdd == undefined ? "N/A" : numberFormat(astraZenecaVaxzevriaCOVISHIELDFirstAdd.value)) +
        "</td><td>" + (allOtherSeriesFirstAdd == undefined ? "N/A" : numberFormat(allOtherSeriesFirstAdd.value)) +
        "</td><td>" + (haveNotReceivedFirstAdd == undefined ? "N/A" : numberFormat(haveNotReceivedFirstAdd.value)) +
        "</td><td>" + (notReportedFirstAdd == undefined ? "N/A" : numberFormat(notReportedFirstAdd.value))
        );
    });
    let seriesAdditionalArray = ["Pfizer-BioNTech Comirnaty 1st Additional", 
    "Moderna Spikevax 1st Additional", 
    "mRNA mixed series 1st Additional", 
    "AstraZeneca Vaxzevria/COVISHIELD-mRNA mixed series 1st Additional", 
    "AstraZeneca Vaxzevria/COVISHIELD 1st Additional", 
    "All other series 1st Additional", 
    "Have not received 1st Additional", 
    "Not reported 1st Additional"];
    
    seriesAdditionalArray.forEach(seriesName => {
      let totalSeries = masterJson.nodes.filter(d => d.name.includes(seriesName));
      let totalLinks = masterJson.links;

      if (seriesName == "mRNA mixed series")
        totalSeries.pop();
      else if (seriesName == "AstraZeneca Vaxzevria/COVISHIELD")
        totalSeries.shift();
        
      let total = totalSeries.find(d => d.name.includes("1st Additional"));
      
      let pizer = totalLinks.filter(d => d.source.name.includes(seriesName));
      let pizerSecondAdd = pizer.find(d => d.target.name == "Pfizer-BioNTech Comirnaty 2nd Additional");

      let moderna = totalLinks.filter(d => d.target.name.includes("Moderna Spikevax") && d.source.name.includes(seriesName));
      let modernaSecondAdd = moderna.find(d => d.target.name == "Moderna Spikevax 2nd Additional");

      let mRNA = totalLinks.filter(d => d.target.name == "mRNA mixed series" && d.source.name.includes(seriesName));
      let mRNASecondAdd = mRNA.find(d => d.target.name == "mRNA mixed series 2nd Additional");
      
      let astraZenecaVaxzevriaCOVISHIELDmRNA = totalLinks.filter(d => d.target.name == "AstraZeneca Vaxzevria/COVISHIELD-mRNA mixed series" && d.source.name.includes(seriesName));
      let astraZenecaVaxzevriaCOVISHIELDmRNASecondAdd = astraZenecaVaxzevriaCOVISHIELDmRNA.find(d => d.target.name == "AstraZeneca Vaxzevria/COVISHIELD-mRNA mixed series 2nd Additional");
      
      let astraZenecaVaxzevriaCOVISHIELD = totalLinks.filter(d => d.target.name == "AstraZeneca Vaxzevria/COVISHIELD" && d.source.name.includes(seriesName));
      let astraZenecaVaxzevriaCOVISHIELDSecondAdd = astraZenecaVaxzevriaCOVISHIELD.find(d => d.target.name == "AstraZeneca Vaxzevria/COVISHIELD 2nd Additional");
      
      let allOtherSeries = totalLinks.filter(d => d.target.name.includes("All other series") && d.source.name.includes(seriesName));
      let allOtherSeriesSecondAdd = allOtherSeries.find(d => d.target.name == "All other series 2nd Additional");
      
      let haveNotReceived = totalLinks.filter(d => d.target.name.includes("2nd") && d.source.name.includes(seriesName));
      let haveNotReceivedSecondAdd = haveNotReceived.find(d => d.target.name == "Moderna Spikevax 2nd Additional");
      
      let notReported = totalLinks.filter(d => d.target.name.includes("Not reported") && d.source.name.includes(seriesName));
      let notReportedSecondAdd = notReported.find(d => d.target.name == "Not reported 2nd Additional");
      
      tableAdditional.append("tr").html(
        "<td>" + (seriesName == "Have not recieved" ? seriesName + " an additional dose" : seriesName) +
        "</td><td>" + (total == undefined ? "N/A" : numberFormat(total.value)) +
        "</td><td>" + (pizerSecondAdd == undefined ? "N/A" : numberFormat(pizerSecondAdd.value)) +
        "</td><td>" + (modernaSecondAdd == undefined ? "N/A" : numberFormat(modernaSecondAdd.value)) +
        "</td><td>" + (mRNASecondAdd == undefined ? "N/A" : numberFormat(mRNASecondAdd.value)) +
        "</td><td>" + (astraZenecaVaxzevriaCOVISHIELDmRNASecondAdd == undefined ? "N/A" : numberFormat(astraZenecaVaxzevriaCOVISHIELDmRNASecondAdd.value)) +
        "</td><td>" + (astraZenecaVaxzevriaCOVISHIELDSecondAdd == undefined ? "N/A" : numberFormat(astraZenecaVaxzevriaCOVISHIELDSecondAdd.value)) +
        "</td><td>" + (allOtherSeriesSecondAdd == undefined ? "N/A" : numberFormat(allOtherSeriesSecondAdd.value)) +
        "</td><td>" + (haveNotReceivedSecondAdd == undefined ? "N/A" : numberFormat(haveNotReceivedSecondAdd.value)) +
        "</td><td>" + (notReportedSecondAdd == undefined ? "N/A" : numberFormat(notReportedSecondAdd.value))
        );
    });
    let seriesArray = [
    "Pfizer-BioNTech Comirnaty Primary", 
    "Moderna Spikevax Primary", 
    "mRNA mixed series Primary", 
    "AstraZeneca Vaxzevria/COVISHIELD-mRNA mixed series Primary", 
    "AstraZeneca Vaxzevria/COVISHIELD Primary", 
    "All other series Primary", 
    "Have not received Primary", 
    "Not reported Primary",
    "Pfizer-BioNTech Comirnaty 1st Additional", 
    "Moderna Spikevax 1st Additional", 
    "mRNA mixed series 1st Additional", 
    "AstraZeneca Vaxzevria/COVISHIELD-mRNA mixed series 1st Additional", 
    "AstraZeneca Vaxzevria/COVISHIELD 1st Additional", 
    "All other series 1st Additional", 
    "Have not received 1st Additional", 
    "Not reported 1st Additional"];
    
    seriesArray.forEach(seriesName => {
      let totalSeries = masterJson.nodes.filter(d => d.name.includes(seriesName));
      let totalLinks = masterJson.links;

      if (seriesName == "mRNA mixed series")
        totalSeries.pop();
      else if (seriesName == "AstraZeneca Vaxzevria/COVISHIELD")
        totalSeries.shift();
        
      let total = totalSeries.find(d => d.name.includes("Primary"));
      
      let pizer = totalLinks.filter(d => d.source.name.includes(seriesName));
      let pizerFirstAdd = pizer.find(d => d.target.name == "Pfizer-BioNTech Comirnaty 1st Additional");
      let pizerSecondAdd = pizer.find(d => d.target.name == "Pfizer-BioNTech Comirnaty 2nd Additional");

      let moderna = totalLinks.filter(d => d.target.name.includes("Moderna Spikevax") && d.source.name.includes(seriesName));
      let modernaFirstAdd = moderna.find(d => d.target.name == "Moderna Spikevax 1st Additional");
      let modernaSecondAdd = moderna.find(d => d.target.name == "Moderna Spikevax 2nd Additional");

      let mRNA = totalLinks.filter(d => d.target.name == "mRNA mixed series" && d.source.name.includes(seriesName));
      let mRNAFirstAdd = mRNA.find(d => d.target.name == "mRNA mixed series 1st Additional");
      let mRNASecondAdd = mRNA.find(d => d.target.name == "mRNA mixed series 2nd Additional");
      
      let astraZenecaVaxzevriaCOVISHIELDmRNA = totalLinks.filter(d => d.target.name == "AstraZeneca Vaxzevria/COVISHIELD-mRNA mixed series" && d.source.name.includes(seriesName));
      let astraZenecaVaxzevriaCOVISHIELDmRNAFirstAdd = astraZenecaVaxzevriaCOVISHIELDmRNA.find(d => d.target.name == "AstraZeneca Vaxzevria/COVISHIELD-mRNA mixed series 1st Additional");
      let astraZenecaVaxzevriaCOVISHIELDmRNASecondAdd = astraZenecaVaxzevriaCOVISHIELDmRNA.find(d => d.target.name == "AstraZeneca Vaxzevria/COVISHIELD-mRNA mixed series 2nd Additional");
      
      let astraZenecaVaxzevriaCOVISHIELD = totalLinks.filter(d => d.target.name == "AstraZeneca Vaxzevria/COVISHIELD" && d.source.name.includes(seriesName));
      let astraZenecaVaxzevriaCOVISHIELDFirstAdd = astraZenecaVaxzevriaCOVISHIELD.find(d => d.target.name == "AstraZeneca Vaxzevria/COVISHIELD 1st Additional");
      let astraZenecaVaxzevriaCOVISHIELDSecondAdd = astraZenecaVaxzevriaCOVISHIELD.find(d => d.target.name == "AstraZeneca Vaxzevria/COVISHIELD 2nd Additional");
      
      let allOtherSeries = totalLinks.filter(d => d.target.name.includes("All other series") && d.source.name.includes(seriesName));
      let allOtherSeriesFirstAdd = allOtherSeries.find(d => d.target.name == "All other series 1st Additional");
      let allOtherSeriesSecondAdd = allOtherSeries.find(d => d.target.name == "All other series 2nd Additional");
      
      let haveNotReceived = totalLinks.filter(d => d.target.name.includes("2nd") && d.source.name.includes(seriesName));
      let haveNotReceivedFirstAdd = haveNotReceived.find(d => d.target.name == "Moderna Spikevax 1st Additional");
      let haveNotReceivedSecondAdd = haveNotReceived.find(d => d.target.name == "Moderna Spikevax 2nd Additional");
      
      let notReported = totalLinks.filter(d => d.target.name.includes("Not reported") && d.source.name.includes(seriesName));
      let notReportedFirstAdd = notReported.find(d => d.target.name == "Not reported 1st Additional");
      let notReportedSecondAdd = notReported.find(d => d.target.name == "Not reported 2nd Additional");
      
      table.append("tr").html(
        "<td>" + (seriesName == "Have not recieved" ? seriesName + " an additional dose" : seriesName) +
        "</td><td>" + (total == undefined ? "N/A" : numberFormat(total.value)) +
        "</td><td>" + (pizerFirstAdd == undefined ? "N/A" : numberFormat(pizerFirstAdd.value)) +
        "</td><td>" + (modernaFirstAdd == undefined ? "N/A" : numberFormat(modernaFirstAdd.value)) +
        "</td><td>" + (mRNAFirstAdd == undefined ? "N/A" : numberFormat(mRNAFirstAdd.value)) +
        "</td><td>" + (astraZenecaVaxzevriaCOVISHIELDmRNAFirstAdd == undefined ? "N/A" : numberFormat(astraZenecaVaxzevriaCOVISHIELDmRNAFirstAdd.value)) +
        "</td><td>" + (astraZenecaVaxzevriaCOVISHIELDFirstAdd == undefined ? "N/A" : numberFormat(astraZenecaVaxzevriaCOVISHIELDFirstAdd.value)) +
        "</td><td>" + (allOtherSeriesFirstAdd == undefined ? "N/A" : numberFormat(allOtherSeriesFirstAdd.value)) +
        "</td><td>" + (haveNotReceivedFirstAdd == undefined ? "N/A" : numberFormat(haveNotReceivedFirstAdd.value)) +
        "</td><td>" + (notReportedFirstAdd == undefined ? "N/A" : numberFormat(notReportedFirstAdd.value)) +
        "</td><td>" + (pizerSecondAdd == undefined ? "N/A" : numberFormat(pizerSecondAdd.value)) +
        "</td><td>" + (modernaSecondAdd == undefined ? "N/A" : numberFormat(modernaSecondAdd.value)) +
        "</td><td>" + (mRNASecondAdd == undefined ? "N/A" : numberFormat(mRNASecondAdd.value)) +
        "</td><td>" + (astraZenecaVaxzevriaCOVISHIELDmRNASecondAdd == undefined ? "N/A" : numberFormat(astraZenecaVaxzevriaCOVISHIELDmRNASecondAdd.value)) +
        "</td><td>" + (astraZenecaVaxzevriaCOVISHIELDSecondAdd == undefined ? "N/A" : numberFormat(astraZenecaVaxzevriaCOVISHIELDSecondAdd.value)) +
        "</td><td>" + (allOtherSeriesSecondAdd == undefined ? "N/A" : numberFormat(allOtherSeriesSecondAdd.value)) +
        "</td><td>" + (haveNotReceivedSecondAdd == undefined ? "N/A" : numberFormat(haveNotReceivedSecondAdd.value)) +
        "</td><td>" + (notReportedSecondAdd == undefined ? "N/A" : numberFormat(notReportedSecondAdd.value))
        );
    });

    const link = svg.append('g').selectAll('.link')
      .data(masterJson.links)
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', path)
      .attr('tabindex', 0)
      .style('stroke-width', d => Math.max(3, d.dy))
      .style('fill', "none")
      .style('stroke', "#000")
      .style('stroke-opacity', 0.15)

    svg.selectAll("path.link")
      .on('mouseover', function(d) {
        svg.selectAll("path").style("opacity", function(path) {
          if (path.source.name == d.source.name) {
            d3.select(this).style('stroke-opacity', 0.25);
            return 1;
          }
          else
            return 0.5;
        })
        hoveredG = d.source.name;
      })
      .on('mouseout', function() {
        d3.selectAll("path").style("opacity", 1);
        d3.selectAll("path").style("stroke-opacity", 0.15);
        hoveredG = ""
      })
      .on('focus', function(d) {
        svg.selectAll("path").style("opacity", function(path) {
          if (path.source.name == d.source.name) {
            d3.select(this).style('stroke-opacity', 0.25);
            return 1;
          }
          else
            return 0.5;
        })
        hoveredG = d.source.name;
      })
      .on('blur', function() {
        d3.selectAll("path").style("opacity", 1);
        d3.selectAll("path").style("stroke-opacity", 0.15);
        hoveredG = ""
      }).sort((a, b) => b.dy - a.dy)

    d3.selectAll("path.link").append('title')
      .text(d => `${format(d.label)} of ${d.source.name} → ${d.target.name}`)

    let hoveredG = "";

    let node = svg.append('g')
      .selectAll('.node')
      .data(masterJson.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('tabindex', 0)
      .style("cursor", "grab")
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .on("mouseover", function(d) {
        svg.selectAll("path").style("opacity", function(path) {
          if (path.source.name == d.name) {
            d3.select(this).style('stroke-opacity', 0.25);
            return 1;
          }
          else
            return 0.5;
        })
        hoveredG = d.name;
      })
      .on("mouseout", function() {
        d3.selectAll("path").style("opacity", 1);
        d3.selectAll("path").style("stroke-opacity", 0.15);
        hoveredG = "";
      })
      .call(d3.drag()
        .on('start', function() { this.parentNode.appendChild(this); })
        .on('drag', dragmove));

    node.append('rect')
      .attr('height', d => {
        if (d.name == "Have not received a 2nd additional dose 2nd Additional") {
          if (ptNumSelection == 48 || ptNumSelection == 13 || ptNumSelection == 62)
            return 0;
          else {
            switch (ptNumSelection) {
              case "1":
                return Math.max(7, d.dy - 190);
                break;
              case "59":
                return Math.max(7, d.dy - 180);
                break;
              case "47":
                return Math.max(7, d.dy - 215);
                break;
              case "46":
                return Math.max(7, d.dy - 215);
                break;
              case "35":
                return Math.max(7, d.dy - 190);
                break;
              case "24":
                return Math.max(7, d.dy - 175);
                break;
              case "29":
                return Math.max(7, d.dy - 190);
                break;
              case "12":
                return Math.max(7, d.dy - 180);
                break;
              case "10":
                return Math.max(7, d.dy - 175);
                break;
              case "11":
                return Math.max(7, d.dy - 215);
                break;
              case "61":
                return Math.max(7, d.dy - 230);
                break;
              case "60":
                return Math.max(7, d.dy - 205);
                break;
              default:
                return Math.max(7, d.dy);
            }
          }
        }
        return Math.max(7, d.dy);
      })
      .attr('width', sankey.nodeWidth()) //+ 80
      .style('fill', (d, i) => {
        d.color = color(d.name.replace("Primary", "").replace("1st Additional", "").replace("2nd Additional", ""));
        if(d.name.includes("Have not received"))
          return "#7cbe70";
        return d.color;
      })
      .style({
        stroke: 'none',
        cursor: 'move',
        'fill-opacity': 0.9,
        'shape-rendering': 'crispEdges'
      });

    node
      .append('title')
      .text(d => {
        let percentageDisplay = "\n";
        d.sourceLinks.forEach(item => {
          percentageDisplay += ((item.value / d.value) * 100).toFixed(4) + "% => " + item.target.name + "\n";
        });
        d.targetLinks.forEach(item => {
          percentageDisplay += item.source.name + " => " + ((item.value / d.value) * 100).toFixed(4) + "%\n";
        })
        return `${format(d.value)} ${d.name} ${percentageDisplay}`;
      });

    node.append("rect")
      .style("fill", "white")
      .style("opacity", 0.6)
      .attr("class","backgroundRect")
      .attr('y', d => {
        if (d.name.includes("Have not received a 2nd additional dose") && (ptNumSelection == 11 || ptNumSelection == 61))
          return (d.dy / 2) - 39;
        return d.dy / 2 - 14
      })
      .attr("height", 25)
      .attr("width", (d) => {
        return (d.name.length + ("("+d.value+")").length)
        })
      .attr("rx", 15);

    node
      .append('text')
      .attr('x', -6)
      .attr('y', d => {
        if (d.name.includes("Have not received a 2nd additional dose") && (ptNumSelection == 11 || ptNumSelection == 61))
          return (d.dy / 2) - 28;
        return d.dy / 2
      })
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .attr('transform', null)
      .attr('id', d => "node" + d.id)
      .style('pointer-events', 'none')
      .style("font-weight", "bold")
      .style('font-size', '15px')
      .style("opacity", d => {
        if (d.name.includes("Have not received a 2nd additional dose") && (ptNumSelection == 48 || ptNumSelection == 13 || ptNumSelection == 62))
          return 0;
        return 1;
      })
      .text(d => d.name.replace("Primary", "").replace("1st Additional", "").replace("2nd Additional", "") + ((d.name.includes("Primary") || d.name.includes("1st Additional")) && !d.name.includes("Have not received an additional dose") ? "(" + numberFormat(d.value) + ")" : "(" + numberFormat(d.value) + ")")) //totalComingIn
      //.call(wrap, 120)
      .filter(d => d.x < width / 2)
      .attr('x', 6 + sankey.nodeWidth())
      .attr('text-anchor', 'start')
      .style('font-size', '15px');
      
    d3.selectAll(".backgroundRect")
      .attr("width",d => {
        return d3.select("#node"+d.id)._groups[0][0].getBBox().width + 8;
        })
      .attr("x",d => {
        return d3.select("#node"+d.id)._groups[0][0].getBBox().x - 4;
        });
    
    d3.selectAll(".link").style("display", (d) => {
      if (d.source.name.includes("Have not received") && d.target.name.includes("Have not received"))
        return "none";
      else
        return "inline";
    });

    function dragmove(d) {
      if (!seriesPause) {
        d3.select(this)
          .attr('transform', `translate(${d.x}, ${(d.y = Math.max(0, Math.min(height - d.dy, d3.event.y)))})`);
        sankey.relayout();
        link.attr('d', path);
      }
    }

    const linkExtent = d3.extent(masterJson.links, d => d.value);

    const frequencyScale = d3.scaleLinear()
      .domain(linkExtent)
      .range([0.05, 1]);

    /* const particleSize = */
    d3.scaleLinear()
      .domain(linkExtent)
      .range([1, 5]);

    masterJson.links.forEach(currentLink => {
      currentLink.freq = frequencyScale(currentLink.value);
      currentLink.particleSize = 2;
      currentLink.particleColor = d3.scaleLinear().domain([0, 1])
        .range([currentLink.source.color, currentLink.target.color]);
    });
    let totalElapsedTime = 0;
    let startTime = d3.now() - totalElapsedTime;
    const seriesT = d3.timer(seriesTick, 1000);

    d3.select("#pauseButtonSeries").on("click", () => {
      seriesPause = (seriesPause ? false : true)
      if (!seriesPause) {
        startTime = d3.now() - totalElapsedTime;
        seriesT.restart(seriesTick);
        d3.select("#pauseButtonSeries").text("Stop animation");
        d3.select("#pauseButtonSeries").classed("btn-warning", true).classed("btn-success", false);
      }
      else {
        totalElapsedTime = d3.now() - startTime;
        seriesT.stop();
        d3.select("#pauseButtonSeries").text("Resume animation");
        d3.select("#pauseButtonSeries").classed("btn-warning", false).classed("btn-success", true);
      }
    });

    d3.selectAll(".dropdownSeries").on("change", function(d) {
      d3.select("#sankeySeriesSVG").transition().duration(700).style("opacity", 0).remove();
      d3.select("#sankeySeriesCanvas").transition().duration(700).style("opacity", 0).remove();
      seriesT.stop();
      setTimeout(function() {
        createSankeySeriesData(d3.select("#ptDropdownSeries").property("value"), true);
        d3.select("#textDescRegion").text($("#ptDropdownSeries")[0].selectedOptions[0].label);
      }, 800);
    });
    //
    totalElapsedTime = d3.now() - startTime;
    seriesT.stop();
    //
    d3.select("#pauseButtonSeries").text("Start animation");

    let particles = [];

    function seriesTick(elapsed /* , time */ ) {
      particles = particles.filter(d => d.current < d.path.getTotalLength());
      var elapsedTime = d3.now() - startTime;
      svg.selectAll('path.link').filter((d) =>
          !d.source.name.includes("Have not received") || !d.target.name.includes("Have not received")
        )
        .each(
          function(d) {
            //        if (d.freq < 1) {
            for (let x = 0; x < 2; x++) {
              const offset = (Math.random() - 0.5) * (d.dy - 4);
              if (Math.random() < d.freq) {
                const length = this.getTotalLength();
                particles.push({
                  link: d,
                  time: elapsedTime,
                  offset,
                  path: this,
                  length,
                  animateTime: length,
                  speed: 0.9 + (d.freq / 3)
                });
                // svg.select("#node"+d.id.substring(0,d.id.indexOf("=")))
                //   .text(n => { 
                //     if(n.value > 0)
                //       n.value = n.value - 1; 
                //       return n.name.replace("Primary","").replace("1st Additional","") +"("+numberFormat(n.value)+")";
                //     });
                // svg.select("#node"+d.id.substring(d.id.indexOf(">")+1))
                //   .text(n => { 
                //     if(n.name.includes("2nd Additional")){
                //       if(n.totalComingIn < n.value)
                //         n.totalComingIn = n.totalComingIn + 1; 
                //       return n.name.replace("2nd Additional","") +"("+numberFormat(n.totalComingIn)+")";
                //     }
                //     return n.name.replace("1st Additional","") +"("+numberFormat(n.value)+")"
                //   });
              }
            }
            //        }
            /*        else {
                      for (let x = 0; x<d.freq; x++) {
                        let offset = (Math.random() - .5) * d.dy;
                        particles.push({link: d, time: elapsed, offset: offset, path: this})
                      }
                    } */
          });

      particleEdgeCanvasPath(elapsedTime);
    }

    function particleEdgeCanvasPath(elapsed) {
      const context = d3.select('#sankeySeriesCanvas').node().getContext('2d');

      context.clearRect(0, 0, width, height + 10);

      context.fillStyle = 'gray';
      context.lineWidth = '1px';
      for (const x in particles) {
        if ({}.hasOwnProperty.call(particles, x)) {
          const currentTime = elapsed - particles[x].time;
          //        let currentPercent = currentTime / 1000 * particles[x].path.getTotalLength();
          particles[x].current = currentTime * 0.15 * particles[x].speed;
          const currentPos = particles[x].path.getPointAtLength(particles[x].current);
          if (particles[x].link.source.name == hoveredG || hoveredG == particles[x].link.target.name) {
            context.beginPath();
            context.fillStyle = particles[x].link.particleColor(0);
            context.arc(
              currentPos.x,
              currentPos.y + particles[x].offset,
              particles[x].link.particleSize,
              0,
              2 * Math.PI
            );
            context.fill();
          }
          else if (hoveredG == "") {
            context.beginPath();
            context.fillStyle = particles[x].link.particleColor(0);
            context.arc(
              currentPos.x,
              currentPos.y + particles[x].offset,
              particles[x].link.particleSize,
              0,
              2 * Math.PI
            );
            context.fill();
          }
        }
      }
    }

  }
});
// d3.csv("./data/sankeyDiagramVaccineStatus.csv").then(function(data){
//   let numberFormat = d3.format(",d");
//   const margin = { top: 1, right: 5, bottom: 6, left: 5 };
//   const width = 1140 - margin.left - margin.right;
//   const height = 600 - margin.top - margin.bottom;

//   const formatNumber = d3.format(',d');
//   const format = d => `${formatNumber(d)}`;
//   const color = d3.scaleOrdinal(["#7cbe70","#40918d","#bbe141","#3c8e99","#457799","#7bd269","#49be86"]);

//   let svg;

//   let canvas;

//   const sankey = d3.sankey()
//       .nodeWidth(15)
//       .nodePadding(15)
//       .size([width, height]);

//   const path = sankey.link();

//   let statusPause = true;
//   let currId;
//   let nodes;
//   let links;
//   let masterJson;
//   let totalValuesJson;
//   createSankeyStatusData("all","total","Total");
//   function createSankeyStatusData(ptSelection,numOrPercent,age){
//       currId = 0;
//       nodes = {};
//       links = {};
//       masterJson = {"nodes": [],"links": []};
//       data.forEach(function(element,index){
//         if((element.pruid == ptSelection || ptSelection == "all") && (element.pop_group == age || age == "total")){
//           if(nodes[element["source"]] == undefined){
//             nodes[element["source"]] = currId;
//             masterJson["nodes"].push({"name": element["source"],"id":currId});
//             currId = currId + 1;
//           }
//           if(nodes[element["target"]] == undefined){
//             nodes[element["target"]] = currId;
//             masterJson["nodes"].push({"name": element["target"],"id":currId, "totalComingIn":0});
//             currId = currId + 1;
//           }
//           if(links[element["source"]+"=>"+element["target"]] == undefined){
//             links[element["source"]+"=>"+element["target"]] = element[numOrPercent];
//             masterJson["links"].push({
//               "source":nodes[element["source"]],
//               "target":nodes[element["target"]],
//               "value":element[numOrPercent].replace(",","").replace(",",""),
//               "label":element[numOrPercent],
//               "id":(nodes[element["source"]] + "=>" + nodes[element["target"]])
//             })
//         } else
//           masterJson["links"].forEach(function(d){
//             if(d["source"] == nodes[element["source"]] && 
//             d["target"] == nodes[element["target"]]){
//               let newVal = Number(d["value"]) + Number(element[numOrPercent].replace(",","").replace(",",""));

//               d["value"] = newVal;
//               d["label"] = newVal;
//             }
//           });
//       }
//       });
//       console.log("Vaccine Status: "+masterJson);
//       createStatusSankey();
//   }
// function createStatusSankey(){
//   statusPause = true;
//   canvas = d3.select("#sankeyAreaStatus").append("canvas")
//       .attr('width', width + margin.left + margin.right)
//       .attr('height', height + margin.top + margin.bottom)
//       .attr('id',"sankeyStatusCanvas")
//       .style('position', 'absolute')
//       .style("pointer-events","none")
//       .style("opacity",0);

//   svg = d3.select('#sankeyAreaStatus').append("svg")
//       .attr('width', width + margin.left + margin.right)
//       .attr('height', height + margin.top + margin.bottom)
//       .attr('id','sankeyStatusSVG')
//       .style("opacity",0)
//       .append('g')
//         .attr('transform', `translate(${margin.left}, ${margin.top})`);

//   d3.select("#sankeyStatusSVG").transition().duration(800).style("opacity",1);
//   d3.select("#sankeyStatusCanvas").transition().duration(800).style("opacity",1);

//     sankey
//       .nodes(masterJson.nodes)
//       .links(masterJson.links)
//       .layout(32);

//     // masterJson.nodes.forEach(node =>{
//     //     let table = d3.select("#tableBody");
//     //     let percentageArray = ["N/A","N/A","N/A","N/A","N/A","N/A","N/A"];
//     //     if(!node.name.includes("Additional")){
//     //       node.sourceLinks.forEach(source =>{
//     //         if(source.target.name.includes("Pfizer-BioNTech"))
//     //           percentageArray[0] = ((source.value/node.value) * 100).toFixed(4);
//     //         else if(source.target.name.includes("Moderna Spikevax"))
//     //           percentageArray[1] = ((source.value/node.value) * 100).toFixed(4);
//     //         else if(source.target.name.includes("Janssen"))
//     //           percentageArray[3] = ((source.value/node.value) * 100).toFixed(4);
//     //         else if(source.target.name.includes("mRNA mixed series"))
//     //           percentageArray[4] = ((source.value/node.value) * 100).toFixed(4);
//     //         else if(source.target.name.includes("AstraZeneca Vaxzevria/COVISHIELD-mRNA mixed series"))
//     //           percentageArray[5] = ((source.value/node.value) * 100).toFixed(4);
//     //         else if(source.target.name.includes("Other"))
//     //           percentageArray[6] = ((source.value/node.value) * 100).toFixed(4);
//     //         else if(source.target.name.includes("AstraZeneca Vaxzevria/COVISHIELD"))
//     //           percentageArray[2] = ((source.value/node.value) * 100).toFixed(4);
//     //       })
//     //       table.append("tr").html("<td>"+node.name+"</td><td>"+percentageArray[0]+"</td><td>"+percentageArray[1]+"</td><td>"+percentageArray[2]+"</td><td>"+percentageArray[3]+"</td><td>"+percentageArray[4]+"</td><td>"+percentageArray[5]+"</td><td>"+percentageArray[6]+"</td>");
//     //     }
//     //     })

//     const link = svg.append('g').selectAll('.link')
//       .data(masterJson.links)
//       .enter().append('path')
//         .attr('class', 'link')
//         .attr('d', path)
//         .style('stroke-width', d => Math.max(3, d.dy))
//         .style('fill', "none")
//         .style('stroke', "#000")
//         .style('stroke-opacity', 0.15)

//       svg.selectAll("path.link").on('mouseover', function (d) {
//         svg.selectAll("path").style("opacity",function(path){
//           if(path.source.name == d.source.name){
//             d3.select(this).style('stroke-opacity', 0.25);
//             return 1;
//           }
//           else
//             return 0.5;
//         })
//         hoveredG = d.source.name;
//       })
//       .on('mouseout', function () {
//           d3.selectAll("path").style("opacity",1);
//           d3.selectAll("path").style("stroke-opacity",0.15);
//         hoveredG = ""
//       });

//     d3.selectAll("path.link").append('title')
//       .text(d => `${format(d.label)} of ${d.source.name} → ${d.target.name}`)//${format(d.value)} of ${masterJson.nodes[0].name}

//     var hoveredG = "";

//     let node = svg.append('g').selectAll('.node')
//       .data(masterJson.nodes)
//       .enter().append('g')
//         .attr('class', 'node')
//         .style("cursor","grab")
//         .attr('transform', d => `translate(${d.x}, ${d.y})`)
//         .on("mouseover", function(d){
//           hoveredG = d.name;
//         })
//         .on("mouseout", function(){
//           hoveredG = ""
//         })
//         .call(d3.drag()
//         .on('start', function () { this.parentNode.appendChild(this); })
//         .on('drag', dragmove));

//     node.append('rect')
//       .attr('height', d => Math.max(7, d.dy))
//       .attr('width', sankey.nodeWidth())
//       .style('fill', (d, i) => {
//         d.color = color(d.name);
//         //d.color = color(i);
//         return d.color;
//       })
//       .style({
//         stroke: 'none',
//         cursor: 'move',
//         'fill-opacity': 0.9,
//         'shape-rendering': 'crispEdges'
//       });

//       node
//       .append('title')
//       .text(d => {
//         let percentageDisplay = "\n";
//         d.sourceLinks.forEach( item => {
//           percentageDisplay += ((item.value/d.value) * 100).toFixed(4) +"% => "+item.target.name+"\n";
//         });
//         d.targetLinks.forEach(item => {
//           percentageDisplay += item.source.name+" => "+((item.value/d.value) * 100).toFixed(4) +"%\n";
//         })
//         return `${format(d.value)} ${d.name} ${percentageDisplay}`;
//       });

//     node.append('text')
//       .attr('x', (d)=>{
//         if(d.name == "At least 1 dose" || d.name == "Primary series completed")
//           return 18;
//         else
//           return -6;
//         })
//       .attr('y', d => d.dy / 2)
//       .attr('dy', '.35em')
//       .attr('text-anchor', 'end')
//       .attr('transform', null)
//       .attr('id', d => "node"+d.id)
//       .style('pointer-events','none')
//       .style('text-shadow','0 1px 0 #fff')
//       .style('font-size','16px')
//       .text(d => d.name + " " + (d.name == "At least 1 dose" || d.name == "Primary series completed" || d.name == "Received at least 1 additional dose" ? "("+numberFormat(d.value)+")":"("+numberFormat(d.totalComingIn)+")"))
//       .call(wrap, 180)
//       .filter(d => d.x < width / 2)
//         .attr('x', 6 + sankey.nodeWidth())
//         .attr('text-anchor', 'start')
//         .style('font-size', '16px');

//     function dragmove(d) {
//       if(!statusPause){
//       d3.select(this)
//         .attr('transform', `translate(${d.x}, ${(d.y = Math.max(0, Math.min(height - d.dy, d3.event.y)))})`);
//       sankey.relayout();
//       link.attr('d', path);
//       }
//     }

//     const linkExtent = d3.extent(masterJson.links, d => d.value);

//     const frequencyScale = d3.scaleLinear()
//       .domain(linkExtent)
//       .range([0.05, 1]);

//     d3.scaleLinear()
//       .domain(linkExtent)
//       .range([1, 5]);

//     masterJson.links.forEach(currentLink => {
//       currentLink.freq = frequencyScale(currentLink.value);
//       currentLink.particleSize = 2;
//       currentLink.particleColor = d3.scaleLinear().domain([0, 1])
//       .range([currentLink.source.color, currentLink.target.color]);
//     });
//     let totalElapsedTime = 0;
//     let startTime = d3.now() - totalElapsedTime;
//     const statusT = d3.timer(statusTick, 1000);

//     d3.select("#pauseButtonStatus").on("click", () => {
//     statusPause = (statusPause ? false:true)
//     if(!statusPause){
//       startTime = d3.now() - totalElapsedTime;
//       statusT.restart(statusTick);
//       d3.select("#pauseButtonStatus").text("Pause");
//     }
//     else{
//       totalElapsedTime = d3.now() - startTime; 
//       statusT.stop();
//       d3.select("#pauseButtonStatus").text("Resume");
//     }
//     });
//     d3.selectAll(".dropdownStatus").on("change", (d) => {
//       d3.select("#sankeyStatusSVG").transition().duration(700).style("opacity",0).remove();
//       d3.select("#sankeyStatusCanvas").transition().duration(700).style("opacity",0).remove();
//       statusT.stop();
//       setTimeout(function(){createSankeyStatusData(d3.select("#ptDropdownStatus").property("value"),d3.select("#ptDropdownStatus2").property("value"),d3.select("#ptDropdownStatus3").property("value"));},800);
//     });

//     //
//     totalElapsedTime = d3.now() - startTime; 
//     statusT.stop();
//     //
//     d3.select("#pauseButtonStatus").text("Start");

//     let particles = [];
//     function statusTick(elapsed /* , time */) {
//       particles = particles.filter(d => d.current < d.path.getTotalLength());
//       var elapsedTime = d3.now() - startTime;
//       svg.selectAll('path.link')
//       .each(
//         function (d) {
//           for (let x = 0; x < 2; x++) {
//             const offset = (Math.random() - 0.5) * (d.dy - 4);
//             if (Math.random() < d.freq) {
//               const length = this.getTotalLength();
//               particles.push({
//                 link: d,
//                 time: elapsedTime,
//                 offset,
//                 path: this,
//                 length,
//                 animateTime: length,
//                 speed: 0.9 + (d.freq/3)
//               });
//               svg.select("#node"+d.id.substring(0,d.id.indexOf("=")))
//                 .text(n => { 
//                   if(n.value >= 1 )
//                     n.value = n.value - 1; 

//                     return n.name +" ("+numberFormat(n.value)+")";
//                   }).call(wrap, 180);
//               svg.select("#node"+d.id.substring(d.id.indexOf(">")+1))
//                 .text(n => { 
//                   if(n.name !== "Primary series completed" && n.name !== "Received at least 1 additional dose"){
//                   if(n.totalComingIn <= n.value)
//                     n.totalComingIn = n.totalComingIn + 1; 
//                   return n.name +" ("+numberFormat(n.totalComingIn)+")";
//                   }
//                   return n.name +" ("+numberFormat(n.value)+")";
//                 }).call(wrap, 170);
//             }
//           }
//         });

//       particleEdgeCanvasPath(elapsedTime);
//     }
//     function particleEdgeCanvasPath(elapsed) {
//       const context = d3.select('#sankeyStatusCanvas').node().getContext('2d');

//       context.clearRect(0, 0, width, height+10);

//       context.fillStyle = 'gray';
//       context.lineWidth = '1px';
//       for (const x in particles) {
//         if ({}.hasOwnProperty.call(particles, x)) {
//           const currentTime = elapsed - particles[x].time;
//           particles[x].current = currentTime * 0.15 * particles[x].speed;
//           const currentPos = particles[x].path.getPointAtLength(particles[x].current);
//           if(particles[x].link.source.name == hoveredG || hoveredG == particles[x].link.target.name){
//             context.beginPath();
//             context.fillStyle = particles[x].link.particleColor(0);
//             context.arc(
//               currentPos.x,
//               currentPos.y + particles[x].offset,
//               particles[x].link.particleSize,
//               0,
//               2 * Math.PI
//             );
//             context.fill();
//           }
//           else if(hoveredG == ""){
//             context.beginPath();
//             context.fillStyle = particles[x].link.particleColor(0);
//             context.arc(
//               currentPos.x,
//               currentPos.y + particles[x].offset,
//               particles[x].link.particleSize,
//               0,
//               2 * Math.PI
//             );
//             context.fill();
//           }
//         }
//       }
//     }
// }
// });
function wrap(text, width) {
  console.log(Math.max(7, text._groups[0][0].__data__.dy));
  text.each(function() {
    if (Math.max(7, d3.select(this)._groups[0][0].__data__.dy) > 40) {
      let text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1,
        y = text.attr("y"),
        x = text.attr("x"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width && line.length != 1) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    }
  });
}

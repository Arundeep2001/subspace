const express = require('express');
const cors = require('cors');
var _ = require('lodash');


const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

app.get('/api/blog-stats', middleware, (req, res) => {
    
    let data = req.data?.blogs;                     // This data contains an object which has a property named "blogs" and this blogs is an array of objects and each object represents a blog.
    if(!data){
        return res.status(500).send({
            message:"Failed",
            data:null,
            error:"Error occured, data not found",        
        });
    }

    var temp1 = _.map(data, 'id');
    var numberOfBlogs = temp1.length;               // Query 1:  Total number of blogs 

    var temp2 = _.uniqBy(data, (x) => x.title);
    var uniqueTitles = _.map(temp2, 'title');       // Query 4:  Array of unique titles

    var longestTitle = _.reduce(uniqueTitles, (a, b) => a.length > b.length ? a : b);  // Query 2: Longest title

    var temp2 = _.map(data, 'title');
    var filterTitle = _.filter(temp2, (x) => { return _.includes(_.toLower(x), "privacy") })
    var privacyCount = filterTitle.length;          //  Query 3: Number of titles containig word "privacy"

    res.status(200).json({
        message:"Success",
        data:{
            "Total blogs": numberOfBlogs,
            "Longest blog title": longestTitle,
            "Privacy count": privacyCount,
            "Array of unique titles": uniqueTitles,
        },
        error:null,
    });
});


app.get('/api/blog-search',middleware,(req,res)=>{

    var query = req.query?.query;
    if(!query){
        return res.status(400).send({
            message:"Failed",
            data:null,
            error:"Incorrect query parameter",        
        });
    }
        
    var data = req.data?.blogs;
    if(!data){
        return res.status(500).send({
            message:"Failed",
            data:null,
            error:"Error occured, data not found",        
        });
    }

    const filteredData = _.filter(data,(x)=>{
        if(_.includes(_.toLower(x.title),query)){
            return x;
        }
    });
    return res.status(200).json({
        message:"Success",
        data: {"Queried Blogs":filteredData},
        error:null
    });   
});


async function middleware(req, res, next) {
    try{
        var data = await fetch("https://intent-kit-16.hasura.app/api/rest/blogs", {
            method: 'GET',
            headers: {
                'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6',
            }
        }) 
        var newData = await data.json(); 
        req.data = newData;
    }
    catch(error){
        return res.status(500).send({
            message:"Failed",
            data:null,
            error:"Error occured, not able to get the data",        
        });
    }   
    next();
}


app.listen(PORT, () => {
    console.log(`Port ${PORT} is listening`);
})

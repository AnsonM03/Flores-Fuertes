using Microsoft.AspNetCore.Mvc;
using FloresFuertes.Models; // Add this using directive for your model

namespace FloresFuertes.Controllers
{
    [ApiController]
    [Route("api/[controller]")] //
    public class StudentController : ControllerBase
    {
        // GET: api/Student
        [HttpGet] //
        public string GetString()
        {
            return "Het endpoint werkt!"; //
        }

        // GET: api/Student/details
        [HttpGet("details")]
        public Student GetStudent()
        {
            Student student = new Student
            {
                Id = 1,
                Studentnummer = "25012345",
                Naam = "Jelle"
            };
            return student;
        }
    }
}
import React, { useState, useEffect } from "react"
import styled from "styled-components"
import Question from "../components/question"
import { useForm } from "react-hook-form"
import OpinionNavigation from "./opinion-navigation"
import axios from "axios"
import { getUser } from "../services/auth"

const OpinionAnswers = ({ userOpinions, selectedCategory }) => {
  const questionList = [
    "Prowadzący miał dobry stosunek do studentów",
    "Prowadzący w jasny sposób przekazywał treść materiału",
    "Prowadzący okazywał zainteresowanie przedmiotem",
    "Prowadzący trzymał się przedstawionych zasad zaliczenia przedmiotu",
    "Prowadzący chętny do pomocy studenom",
  ]

  const { register, reset, watch, handleSubmit } = useForm()
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [opinionId, setOpinionId] = useState(NaN)

  useEffect(() => {
    let obj = {}
    const categoryNameList = userOpinions.map(
      ({ opinions_category }) => opinions_category.category_name
    )

    const isOpinionAlreadyRated = categoryNameList.includes(
      selectedCategory.category_name
    )

    !isOpinionAlreadyRated && setOpinionId(NaN)

    userOpinions.map(({ opinions_category, questions, id }) => {
      if (opinions_category.category_name === selectedCategory.category_name) {
        setOpinionId(id)
        questions.map(({ question_id, value }) => {
          obj[`${question_id}`] = `${value}`
        })
      }
    })

    setCurrentQuestion(1)
    reset(obj)
  }, [userOpinions, selectedCategory])

  const onSubmit = data => {
    let questions = []

    Object.keys(data).map(answer => {
      questions.push({
        question_id: answer,
        value: data[answer],
      })
    })

    if (isNaN(opinionId)) {
      axios
        .post("https://co-tam-profesorku-backend.herokuapp.com/opinions", {
          opinions_category: [selectedCategory.id],
          users_permissions_user: [getUser().id],
          questions: questions,
        })
        .then(response => {
          console.log(response)
        })
    } else {
      axios
        .put(`https://co-tam-profesorku-backend.herokuapp.com/opinions/${opinionId}`, {
          opinions_category: [selectedCategory.id],
          users_permissions_user: [getUser().id],
          questions: questions,
        })
        .then(response => {
          console.log(response)
        })
    }
  }

  return (
    <form style={{ padding: "2rem" }} onSubmit={handleSubmit(onSubmit)}>
      {questionList.map((question, index) => (
        <StyledQuestionSection
          key={index}
          isActive={index + 1 === currentQuestion}
        >
          <Question
            label={`${index + 1}. ${question}`}
            inputRef={register}
            questionNumber={index}
          />
        </StyledQuestionSection>
      ))}

      <OpinionNavigation
        activeQuestion={currentQuestion}
        setActiveQuestion={setCurrentQuestion}
        questionQuantity={questionList.length}
        watch={watch}
      />
    </form>
  )
}

export default OpinionAnswers

const StyledQuestionSection = styled.div`
  display: ${props => (props.isActive ? "inherit" : "none")};
`

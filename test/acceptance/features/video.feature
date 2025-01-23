@FiapX
Feature: Video Upload
  Allows users to upload their videos.

  Scenario: 
    Given a video is sent to the service
    When the app finishes storing the video
    Then the user received the video id
    And the user received the video upload signed url

  # Scenario: 
  #   Given a payment was requested
  #   When the payment instruction is rejected
  #   Then the payment gets rejected
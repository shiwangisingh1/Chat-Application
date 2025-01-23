package com.substring.chat.chat_app_backend.controllers;

import com.substring.chat.chat_app_backend.entities.Message;
import com.substring.chat.chat_app_backend.entities.Room;
import com.substring.chat.chat_app_backend.payload.MessageRequest;
import com.substring.chat.chat_app_backend.repositories.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@CrossOrigin("http://localhost:5173")
public class ChatController {
    @Autowired
    private RoomRepository roomRepository;

     //for sending and recieving messages
    @MessageMapping("/sendMessage/{roomId}")//app/sendMessage
    @SendTo("/topic/room/{roomId}")//subscribe
    public Message sendMessage(
            @DestinationVariable String roomId,
            @RequestBody MessageRequest request
    ){
      Room room = roomRepository.findByRoomId(request.getRoomId());
      Message message=new Message();
      message.setContent(request.getContent());
      message.setSender(request.getSender());
      message.setTimeStamp(LocalDateTime.now());
      if (room!=null){
          room.getMessages().add(message);
          roomRepository.save(room);
      }else{
          throw new RuntimeException("room not found !!");
      }
      return message;
    }



}
